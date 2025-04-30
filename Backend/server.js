import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import childRoutes from "./routes/childRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

import multer from "multer";
import speechController from "./controllers/speechController.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import visualRoutes from "./routes/visualRoute.js";

import pictureRoutes from "./routes/pictureRoutes.js";
import graphemeRoutes from "./routes/graphemeRoutes.js";
import sequenceRoutes from "./routes/sequenceRoutes.js";
import soundBlendingRoutes from "./routes/soundBlendingRoute.js";
import symbolSequenceRoutes from "./routes/symbolSequenceRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";
import geminiInferenceRoutes from "./utils/geminiInference.js";
app.use(
  cors({
    origin: ["https://jiveesha.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/", childRoutes);
app.use("/", testRoutes);
app.use("/", visualRoutes);

// Start server
app.use("/", pictureRoutes);
app.use("/", graphemeRoutes);
app.use("/", sequenceRoutes);
app.use("/", soundBlendingRoutes);
app.use("/", symbolSequenceRoutes);
app.use("/vocabulary", vocabularyRoutes); // Use vocabulary routes with /vocabulary prefix
app.use("/", geminiInferenceRoutes);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

// Transcription endpoint
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await speechController.handleTranscriptionRequest(req.file);
    res.json(result);
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({
      error: "Transcription failed",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
