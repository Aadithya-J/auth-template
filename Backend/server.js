import 'dotenv/config';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import childRoutes from "./routes/childRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

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
    origin: ["https://jiveesha.vercel.app", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Serve static files from the Frontend/dist directory
app.use(express.static(join(__dirname, '../Frontend/dist')));

// API routes - all prefixed with /api
app.use("/api/auth", authRoutes);
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

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../Frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
