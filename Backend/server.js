import 'dotenv/config';
import express from "express";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import childRoutes from "./routes/childRoutes.js";
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
import speechController from "./controllers/speechController.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["https://jiveesha.vercel.app", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

app.use("/api", authRoutes);
app.use("/api", childRoutes);
app.use("/api", testRoutes);
app.use("/api", visualRoutes);
app.use("/api", pictureRoutes);
app.use("/api", graphemeRoutes);
app.use("/api", sequenceRoutes);
app.use("/api", soundBlendingRoutes);
app.use("/api", symbolSequenceRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api", geminiInferenceRoutes);

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
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

const frontendDistPath = join(__dirname, '../Frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
     const indexPath = join(frontendDistPath, 'index.html');
     res.sendFile(indexPath);
  } else {
     res.status(404).send('Not Found');
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Something broke!", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});