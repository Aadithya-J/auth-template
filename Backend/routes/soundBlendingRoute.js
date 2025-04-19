import express from "express";
import {
  submitResults,
  getSoundBlendingByChild,
} from "../controllers/soundBlendingController.js";

const router = express.Router();

router.post("/submitResults", submitResults);
router.get("/getSoundBlendingByChild/:childId", getSoundBlendingByChild);

export default router;
