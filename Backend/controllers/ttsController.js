import { getTTSAudio } from "../utils/bhashiniClient.js";

export const ttsHandler = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioBuffer = await getTTSAudio(text);

    res.setHeader("Content-Type", "audio/wav");
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Controller Error:", error.message);
    res.status(500).json({ error: "Failed to generate TTS audio" });
  }
};
