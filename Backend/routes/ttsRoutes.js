import express from "express";
import { ttsHandler } from "../controllers/ttsController.js";

const router = express.Router();

router.post("/tts", ttsHandler);

export default router;
