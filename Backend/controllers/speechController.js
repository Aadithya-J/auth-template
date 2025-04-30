import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import pkg from "fluent-ffmpeg";
const { setFfmpegPath } = pkg;
import ffmpegStatic from "ffmpeg-static";
import speech from "microsoft-cognitiveservices-speech-sdk";

// Configure __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure FFmpeg path
if (ffmpegStatic) {
  setFfmpegPath(ffmpegStatic);
}

class SpeechController {
  constructor() {
    if (!process.env.AZURE_SPEECH_KEY) {
      throw new Error("Azure Speech key not configured");
    }

    this.speechConfig = speech.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION || "eastus"
    );
    this.speechConfig.speechRecognitionLanguage = "en-US";

    // Enable detailed logging (optional)
    this.speechConfig.setProperty(
      speech.PropertyId.Speech_LogFilename,
      "azure-speech-debug.log"
    );
  }

  /**
   * Convert audio to WAV format with silence padding
   */
  async convertToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log(`Converting ${inputPath} to padded WAV at ${outputPath}`);

      // First convert to basic WAV format
      const command = pkg(inputPath)
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec("pcm_s16le")
        .format("wav");

      // Add 500ms of silence padding at start and end
      command
        .input("anullsrc=r=16000:cl=mono")
        .inputOptions([
          "-f lavfi",
          "-t 0.5", // 500ms silence
        ])
        .complexFilter([
          "[0][1]concat=n=2:v=0:a=1[extended]", // Add silence at start
          "[extended][1]concat=n=2:v=0:a=1", // Add silence at end
        ]);

      command
        .output(outputPath)
        .on("end", () => {
          console.log("Audio conversion with padding successful");
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error("Audio conversion failed:", err);
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * Transcribe audio using continuous recognition
   */
  async transcribeAudio(filePath) {
    return new Promise((resolve, reject) => {
      console.log("Starting transcription...");

      // Validate file exists
      if (!fs.existsSync(filePath)) {
        return reject(new Error("Audio file not found"));
      }

      const fileStats = fs.statSync(filePath);
      if (fileStats.size < 1000) {
        console.warn("Warning: Audio file is very small (<1KB)");
      }

      const pushStream = speech.AudioInputStream.createPushStream();
      fs.createReadStream(filePath)
        .on("data", (chunk) => pushStream.write(chunk))
        .on("end", () => pushStream.close())
        .on("error", (err) => reject(err));

      const audioConfig = speech.AudioConfig.fromStreamInput(pushStream);
      const recognizer = new speech.SpeechRecognizer(
        this.speechConfig,
        audioConfig
      );

      let resultText = "";
      let confidence = null;
      let hasResult = false;

      recognizer.recognized = (s, e) => {
        if (
          e.result.reason === speech.ResultReason.RecognizedSpeech &&
          e.result.text
        ) {
          resultText = e.result.text;
          hasResult = true;

          // Extract confidence score
          const jsonResult = e.result.properties.getProperty(
            speech.PropertyId.SpeechServiceResponse_JsonResult
          );
          if (jsonResult) {
            try {
              const parsed = JSON.parse(jsonResult);
              confidence = parsed.NBest?.[0]?.Confidence || null;
            } catch (e) {
              console.warn("Could not parse confidence score", e);
            }
          }
        }
      };

      recognizer.canceled = (s, e) => {
        if (e.reason === speech.CancellationReason.Error) {
          reject(new Error(`Azure Error: ${e.errorDetails}`));
        }
      };

      recognizer.sessionStopped = () => {
        recognizer.close();
        if (hasResult) {
          resolve({
            transcription: resultText.trim(),
            confidence: confidence,
          });
        } else {
          reject(new Error("No speech detected in audio"));
        }
      };

      // Start recognition with 1.5s timeout (adjust as needed)
      recognizer.startContinuousRecognitionAsync(
        () =>
          setTimeout(() => {
            if (!hasResult) {
              recognizer.stopContinuousRecognitionAsync();
            }
          }, 1500),
        (err) => reject(new Error(`Recognition failed to start: ${err}`))
      );
    });
  }

  /**
   * Main handler for transcription requests
   */
  async handleTranscriptionRequest(file) {
    let tempPaths = [];
    try {
      // Create temp file paths
      const originalPath = join(
        __dirname,
        "../uploads",
        `${Date.now()}-original`
      );
      const convertedPath = join(
        __dirname,
        "../uploads",
        `${Date.now()}-padded.wav`
      );
      tempPaths = [originalPath, convertedPath];

      // Save uploaded file
      console.log("Saving uploaded file to:", originalPath);
      await fs.promises.writeFile(originalPath, file.buffer);

      // Convert to padded WAV
      await this.convertToWav(originalPath, convertedPath);

      // Verify output file
      const stats = fs.statSync(convertedPath);
      console.log("Padded WAV file size:", stats.size, "bytes");

      // Log audio duration
      await new Promise((resolve) => {
        pkg.ffprobe(convertedPath, (err, metadata) => {
          if (!err) {
            console.log("Audio duration:", metadata.format.duration, "seconds");
          }
          resolve();
        });
      });

      // Transcribe
      const result = await this.transcribeAudio(convertedPath);
      console.log("Transcription successful:", result);
      return result;
    } catch (error) {
      console.error("Transcription failed:", error);
      throw error;
    } finally {
      // Clean up temp files
      for (const filePath of tempPaths) {
        try {
          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted temp file: ${filePath}`);
          }
        } catch (err) {
          console.error(`Error deleting ${filePath}:`, err);
        }
      }
    }
  }
}

export default new SpeechController();
