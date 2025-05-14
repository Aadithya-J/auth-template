import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";

import authRoutes from "./routes/authRoutes.js";
import childRoutes from "./routes/childRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import visualRoutes from "./routes/visualRoute.js";
import pictureRoutes from "./routes/pictureRoutes.js";
import graphemeRoutes from "./routes/graphemeRoutes.js";
import sequenceRoutes from "./routes/sequenceRoutes.js";
import soundBlendingRoutes from "./routes/soundBlendingRoute.js";
import symbolSequenceRoutes from "./routes/symbolSequenceRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";
import geminiInferenceRoutes from "./utils/geminiInference.js";
import { mkdirSync } from "fs";
import { transcribeAudio } from "./controllers/speechController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;


mkdirSync("uploads", { recursive: true });


app.use(cors());
app.use(express.json());

// API routes
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

// Multer memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// ULCA‐only transcription endpoint
app.post("/api/transcribe", upload.single("file"), transcribeAudio);

// Serve frontend
const frontendDist = join(__dirname, "../Frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (req, res) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    res.sendFile(join(frontendDist, "index.html"));
  } else {
    res.status(404).send("Not Found");
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Something broke!", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
