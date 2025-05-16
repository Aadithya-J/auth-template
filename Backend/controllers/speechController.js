// controllers/speechController.js
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { stat } from "fs/promises";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

const validateAudioFile = async (buffer) => {
  const type = await fileTypeFromBuffer(buffer);
  if (!type) throw new Error("Unable to determine file type");

  // Strip parameters like "; codecs=opus"
  const baseMime = type.mime.split(";")[0].trim();

  const supported = [
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "video/webm",
    "audio/ogg",
    "application/ogg",
    "audio/opus",
  ];

  if (!supported.includes(baseMime)) {
    throw new Error(`Unsupported audio format: ${type.mime}`);
  }
  return type;
};

const convertToWav = async (inputPath) => {
  const outputPath = `${inputPath}.converted.wav`;
  const cmd = [
    `ffmpeg -y -i "${inputPath}"`,
    `-ac 1 -ar 16000`,
    `-af "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-60dB,` +
      `areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-60dB,` +
      `loudnorm=I=-16:TP=-1.5:LRA=11"`,
    `-f wav "${outputPath}"`,
  ].join(" ");
  try {
    await execPromise(cmd);
    if (!existsSync(outputPath)) {
      throw new Error("FFmpeg conversion failed");
    }
    const { size } = await stat(outputPath);
    if (size < 500) throw new Error("Converted file too small");
    return outputPath;
  } catch (err) {
    if (existsSync(outputPath)) unlinkSync(outputPath);
    throw new Error(`Conversion error: ${err.message}`);
  }
};

const hasAudioContent = (buffer) => {
  if (buffer.length < 1000) return false;
  const header = 44;
  for (let i = header; i < Math.min(header + 2000, buffer.length); i += 2) {
    if (Math.abs(buffer.readInt16LE(i)) > 50) return true;
  }
  return false;
};

export const transcribeAudio = async (req, res) => {
  const language = req.body.language;
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const origPath = `uploads/${Date.now()}-${req.file.originalname}`;
  writeFileSync(origPath, req.file.buffer);

  let wavPath = null;
  try {
    const buffer = readFileSync(origPath);
    const fileType = await validateAudioFile(buffer);

    wavPath = await convertToWav(origPath);
    const processed = readFileSync(wavPath);
    if (!hasAudioContent(processed)) {
      throw new Error("Audio contains no meaningful sound");
    }

    const audioBase64 = processed.toString("base64");
    const durationSec = processed.length / (16000 * 2);

    if (audioBase64.length < 100) {
      throw new Error("Base64 data too short");
    }
    const getServiceIdByLanguage = (lang) => {
      switch (lang) {
        case "ta":
          return process.env.SERVICE_ID_TAMIL;
        case "hi":
          return process.env.SERVICE_ID_HINDI;
        case "en":
          return process.env.SERVICE_ID_ENGLISH;
        default:
          throw new Error("Unsupported language");
      }
    };
    const payload = {
      pipelineTasks: [
        {
          taskType: "asr",
          config: {
            language: { sourceLanguage: language }, // 'ta', 'hi', or 'en'
            serviceId: getServiceIdByLanguage(language),
            audioFormat: "wav",
            samplingRate: 16000,
          },
        },
      ],
      inputData: {
        audio: [{ audioContent: audioBase64 }],
      },
    };

    const response = await axios.post(process.env.ASR_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.INFERENCE_API_KEY,
        userID: process.env.USER_ID,
        ulcaApiKey: process.env.ULCA_API_KEY,
      },
      timeout: 300_000,
    });

    const transcript =
      response.data.pipelineResponse?.[0]?.output?.[0]?.source || "";
    if (!transcript) throw new Error("No transcription received");

    res.json({
      success: true,
      transcription: transcript
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:]*$/, ""),
      audioDetails: {
        originalFormat: fileType.mime,
        duration: `${durationSec.toFixed(1)}s`,
        processedSize: processed.length,
      },
    });
  } catch (err) {
    console.error("Transcription Error:", err);
    res.status(500).json({
      success: false,
      error: "Audio processing failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    [origPath, wavPath].filter(Boolean).forEach((p) => {
      try {
        if (existsSync(p)) unlinkSync(p);
      } catch {}
    });
  }
};
