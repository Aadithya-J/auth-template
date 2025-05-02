import { readFileSync, unlinkSync, existsSync } from "fs";
import { stat } from "fs/promises";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

const validateAudioFile = async (buffer) => {
  const type = await fileTypeFromBuffer(buffer);
  if (!type) throw new Error("Unable to determine file type");

  const supportedFormats = [
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "video/webm",
  ];

  if (!supportedFormats.includes(type.mime)) {
    throw new Error(`Unsupported audio format: ${type.mime}`);
  }

  return type;
};

const convertToWav = async (inputPath) => {
  const outputPath = `${inputPath}.converted.wav`;

  try {
    if (!existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const command = `ffmpeg -y -i "${inputPath}" -ac 1 -ar 16000 -af "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-60dB,areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-60dB,loudnorm=I=-16:TP=-1.5:LRA=11" -f wav "${outputPath}"`;
    const { stderr } = await execPromise(command);

    if (!existsSync(outputPath)) {
      throw new Error(`Conversion failed: ${stderr}`);
    }

    const stats = await stat(outputPath);
    if (stats.size < 1000) {
      throw new Error(
        "Converted audio is too small to contain meaningful data"
      );
    }

    return outputPath;
  } catch (err) {
    if (existsSync(outputPath)) {
      try {
        unlinkSync(outputPath);
      } catch (cleanupError) {
        console.error("Failed to clean up:", cleanupError);
      }
    }

    throw new Error(`FFmpeg conversion failed: ${err.message}`);
  }
};

const hasAudioContent = (buffer) => {
  if (buffer.length < 1000) {
    return false;
  }

  const headerSize = 44;
  let hasNonZeroSamples = false;

  const samplesEnd = Math.min(headerSize + 2000, buffer.length);
  for (let i = headerSize; i < samplesEnd; i += 2) {
    const amplitude = Math.abs(buffer.readInt16LE(i));
    if (amplitude > 50) {
      hasNonZeroSamples = true;
      break;
    }
  }

  return hasNonZeroSamples;
};

export const transcribeAudio = async (req, res) => {
  let filePath = req.file?.path;
  let convertedPath = null;
  let originalFilePath = req.file?.path;

  try {
    if (!req.file) {
      throw new Error("No audio file provided in the request");
    }

    console.log(
      `Received file: ${req.file.originalname}, size: ${req.file.size} bytes, mimetype: ${req.file.mimetype}`
    );

    let audioBuffer = readFileSync(filePath);
    const fileType = await validateAudioFile(audioBuffer).catch((err) => {
      throw new Error(`File validation failed: ${err.message}`);
    });

    console.log(`Validated audio file: ${fileType.ext}, ${fileType.mime}`);

    console.log("Processing audio to ensure quality...");
    convertedPath = await convertToWav(filePath);
    filePath = convertedPath;
    audioBuffer = readFileSync(filePath);
    console.log("Audio processing completed successfully");

    if (!hasAudioContent(audioBuffer)) {
      throw new Error(
        "Audio file contains no meaningful sound. Please ensure the recording is not silent."
      );
    }

    const audioBase64 = audioBuffer.toString("base64");
    const audioLength = audioBuffer.length / (16000 * 2);
    if (audioLength < 0.5) {
      throw new Error(
        `Audio duration (${audioLength.toFixed(
          1
        )}s) must be Minimum 0.5s required.`
      );
    }

    if (audioBase64.length < 1000) {
      throw new Error("Generated base64 audio data is too short");
    }

    const payload = {
      pipelineTasks: [
        {
          taskType: "asr",
          config: {
            language: {
              sourceLanguage: "en",
            },
            serviceId:
              process.env.SERVICE_ID || "ai4bharat/whisper-medium-en--gpu--t4",
            audioFormat: "wav",
            samplingRate: 16000,
          },
        },
      ],
      inputData: {
        audio: [
          {
            audioContent: audioBase64,
          },
        ],
      },
    };

    console.log("Payload prepared, calling ASR API...");
    console.log(`Audio base64 length: ${audioBase64.length} characters`);
    console.log(`Audio base64 starts with: ${audioBase64.substring(0, 30)}...`);

    if (!audioBase64.match(/^[A-Za-z0-9+/=]+$/)) {
      throw new Error("Generated base64 string contains invalid characters");
    }

    console.log(
      "Task config:",
      JSON.stringify(payload.pipelineTasks[0].config, null, 2)
    );

    const MAX_RETRIES = 2;
    let retryCount = 0;
    let response;
    let lastError;

    while (retryCount <= MAX_RETRIES) {
      try {
        response = await axios.post(process.env.ASR_API_URL, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.INFERENCE_API_KEY,
            userID: process.env.USER_ID,
            ulcaApiKey: process.env.ULCA_API_KEY,
          },
          timeout: 300000,
        });

        console.log(`ASR API Response Status: ${response.status}`);
        break;
      } catch (err) {
        lastError = err;

        console.error("API call failed:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: JSON.stringify(err.response?.data || {}),
          message: err.message,
        });

        if (retryCount === MAX_RETRIES) {
          if (err.response?.status === 422) {
            try {
              console.log(
                "Raw 422 error response:",
                JSON.stringify(err.response.data)
              );
              const errorDetails = err.response.data?.detail || [];

              let errorMessages;
              if (Array.isArray(errorDetails)) {
                errorMessages = errorDetails
                  .map((d) => d.msg || d.type || JSON.stringify(d))
                  .join(", ");
              } else {
                errorMessages = JSON.stringify(errorDetails);
              }

              throw new Error(`API validation failed: ${errorMessages}`);
            } catch (parseErr) {
              console.error("Error parsing API error:", parseErr);
              throw new Error(
                `API validation failed: ${err.response.statusText}`
              );
            }
          }
          throw err;
        }

        retryCount++;
        const waitTime = 1000 * retryCount;
        console.warn(
          `Attempt ${retryCount} failed. Retrying in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    if (!response.data?.pipelineResponse) {
      throw new Error("Invalid API response structure");
    }

    const asrResponse = response.data.pipelineResponse[0];
    if (!asrResponse?.output?.length) {
      throw new Error("No transcription output received");
    }

    let transcription = asrResponse.output[0].source;
    if (typeof transcription !== "string") {
      throw new Error("Invalid transcription format");
    }

    transcription = transcription
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]*$/, "");

    if (!transcription) {
      throw new Error("Transcription resulted in empty text");
    }

    console.log(
      `Successfully transcribed: "${transcription.substring(0, 50)}${
        transcription.length > 50 ? "..." : ""
      }"`
    );

    res.json({
      success: true,
      transcription,
      audioDetails: {
        originalFormat: fileType.mime,
        duration: audioLength.toFixed(1) + "s",
        processedSize: audioBuffer.length,
      },
    });
  } catch (error) {
    console.error("Transcription Error:", {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        file: req.file
          ? {
              originalname: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
            }
          : null,
        body: req.body,
      },
      apiError: error.isAxiosError
        ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
              url: error.config?.url,
              method: error.config?.method,
            },
          }
        : null,
    });

    res.status(error.response?.status || 500).json({
      success: false,
      error: "Audio processing failed",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              type: error.name,
              ...(error.response?.data && { apiError: error.response.data }),
            }
          : undefined,
    });
  } finally {
    const filesToClean = [originalFilePath, filePath, convertedPath].filter(
      Boolean
    );
    for (const file of filesToClean) {
      try {
        if (existsSync(file)) {
          unlinkSync(file);
          console.log(`Cleaned up temporary file: ${file}`);
        }
      } catch (cleanupError) {
        console.error(`File cleanup failed for ${file}:`, cleanupError);
      }
    }
  }
};

// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// import fs from "fs";
// import pkg from "fluent-ffmpeg";
// const { setFfmpegPath } = pkg;
// import ffmpegStatic from "ffmpeg-static";
// import speech from "microsoft-cognitiveservices-speech-sdk";

// // Configure __dirname equivalent for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Configure FFmpeg path
// if (ffmpegStatic) {
//   setFfmpegPath(ffmpegStatic);
// }

// class SpeechController {
//   constructor() {
//     if (!process.env.AZURE_SPEECH_KEY) {
//       throw new Error("Azure Speech key not configured");
//     }

//     this.speechConfig = speech.SpeechConfig.fromSubscription(
//       process.env.AZURE_SPEECH_KEY,
//       process.env.AZURE_SPEECH_REGION || "eastus"
//     );
//     this.speechConfig.speechRecognitionLanguage = "en-US";

//     // Enable detailed logging (optional)
//     this.speechConfig.setProperty(
//       speech.PropertyId.Speech_LogFilename,
//       "azure-speech-debug.log"
//     );
//   }

//   /**
//    * Convert audio to WAV format with silence padding
//    */
//   async convertToWav(inputPath, outputPath) {
//     return new Promise((resolve, reject) => {
//       console.log(`Converting ${inputPath} to padded WAV at ${outputPath}`);

//       // First convert to basic WAV format
//       const command = pkg(inputPath)
//         .audioFrequency(16000)
//         .audioChannels(1)
//         .audioCodec("pcm_s16le")
//         .format("wav");

//       // Add 500ms of silence padding at start and end
//       command
//         .input("anullsrc=r=16000:cl=mono")
//         .inputOptions([
//           "-f lavfi",
//           "-t 0.5", // 500ms silence
//         ])
//         .complexFilter([
//           "[0][1]concat=n=2:v=0:a=1[extended]", // Add silence at start
//           "[extended][1]concat=n=2:v=0:a=1", // Add silence at end
//         ]);

//       command
//         .output(outputPath)
//         .on("end", () => {
//           console.log("Audio conversion with padding successful");
//           resolve(outputPath);
//         })
//         .on("error", (err) => {
//           console.error("Audio conversion failed:", err);
//           reject(new Error(`FFmpeg error: ${err.message}`));
//         })
//         .run();
//     });
//   }

//   /**
//    * Transcribe audio using continuous recognition
//    */
//   async transcribeAudio(filePath) {
//     return new Promise((resolve, reject) => {
//       console.log("Starting transcription...");

//       // Validate file exists
//       if (!fs.existsSync(filePath)) {
//         return reject(new Error("Audio file not found"));
//       }

//       const fileStats = fs.statSync(filePath);
//       if (fileStats.size < 1000) {
//         console.warn("Warning: Audio file is very small (<1KB)");
//       }

//       const pushStream = speech.AudioInputStream.createPushStream();
//       fs.createReadStream(filePath)
//         .on("data", (chunk) => pushStream.write(chunk))
//         .on("end", () => pushStream.close())
//         .on("error", (err) => reject(err));

//       const audioConfig = speech.AudioConfig.fromStreamInput(pushStream);
//       const recognizer = new speech.SpeechRecognizer(
//         this.speechConfig,
//         audioConfig
//       );

//       let resultText = "";
//       let confidence = null;
//       let hasResult = false;

//       recognizer.recognized = (s, e) => {
//         if (
//           e.result.reason === speech.ResultReason.RecognizedSpeech &&
//           e.result.text
//         ) {
//           resultText = e.result.text;
//           hasResult = true;

//           // Extract confidence score
//           const jsonResult = e.result.properties.getProperty(
//             speech.PropertyId.SpeechServiceResponse_JsonResult
//           );
//           if (jsonResult) {
//             try {
//               const parsed = JSON.parse(jsonResult);
//               confidence = parsed.NBest?.[0]?.Confidence || null;
//             } catch (e) {
//               console.warn("Could not parse confidence score", e);
//             }
//           }
//         }
//       };

//       recognizer.canceled = (s, e) => {
//         if (e.reason === speech.CancellationReason.Error) {
//           reject(new Error(`Azure Error: ${e.errorDetails}`));
//         }
//       };

//       recognizer.sessionStopped = () => {
//         recognizer.close();
//         if (hasResult) {
//           resolve({
//             transcription: resultText.trim(),
//             confidence: confidence,
//           });
//         } else {
//           reject(new Error("No speech detected in audio"));
//         }
//       };

//       // Start recognition with 1.5s timeout (adjust as needed)
//       recognizer.startContinuousRecognitionAsync(
//         () =>
//           setTimeout(() => {
//             if (!hasResult) {
//               recognizer.stopContinuousRecognitionAsync();
//             }
//           }, 1500),
//         (err) => reject(new Error(`Recognition failed to start: ${err}`))
//       );
//     });
//   }

//   /**
//    * Main handler for transcription requests
//    */
//   async handleTranscriptionRequest(file) {
//     let tempPaths = [];
//     try {
//       // Create temp file paths
//       const originalPath = join(
//         __dirname,
//         "../uploads",
//         `${Date.now()}-original`
//       );
//       const convertedPath = join(
//         __dirname,
//         "../uploads",
//         `${Date.now()}-padded.wav`
//       );
//       tempPaths = [originalPath, convertedPath];

//       // Save uploaded file
//       console.log("Saving uploaded file to:", originalPath);
//       await fs.promises.writeFile(originalPath, file.buffer);

//       // Convert to padded WAV
//       await this.convertToWav(originalPath, convertedPath);

//       // Verify output file
//       const stats = fs.statSync(convertedPath);
//       console.log("Padded WAV file size:", stats.size, "bytes");

//       // Log audio duration
//       await new Promise((resolve) => {
//         pkg.ffprobe(convertedPath, (err, metadata) => {
//           if (!err) {
//             console.log("Audio duration:", metadata.format.duration, "seconds");
//           }
//           resolve();
//         });
//       });

//       // Transcribe
//       const result = await this.transcribeAudio(convertedPath);
//       console.log("Transcription successful:", result);
//       return result;
//     } catch (error) {
//       console.error("Transcription failed:", error);
//       throw error;
//     } finally {
//       // Clean up temp files
//       for (const filePath of tempPaths) {
//         try {
//           if (filePath && fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//             console.log(`Deleted temp file: ${filePath}`);
//           }
//         } catch (err) {
//           console.error(`Error deleting ${filePath}:`, err);
//         }
//       }
//     }
//   }
// }

// export default new SpeechController();
