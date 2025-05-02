import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import childRoutes from "./routes/childRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
import { transcribeAudio } from "./controllers/speechController.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import visualRoutes from "./routes/visualRoute.js";
import multer from "multer";
import pictureRoutes from "./routes/pictureRoutes.js";
import graphemeRoutes from "./routes/graphemeRoutes.js";
import sequenceRoutes from "./routes/sequenceRoutes.js";
import soundBlendingRoutes from "./routes/soundBlendingRoute.js";
import symbolSequenceRoutes from "./routes/symbolSequenceRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";
import geminiInferenceRoutes from "./utils/geminiInference.js";
import { mkdirSync } from "fs";
mkdirSync("uploads", { recursive: true });

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

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
});

app.post("/transcribe", upload.single("file"), transcribeAudio);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
