import { Router } from "express";
import {
  evaluateResults,
  getTestResults,
} from "../controllers/graphemeController.js";
const router = Router();

router.get("/getGraphemeByChild/:childId", getTestResults);
router.post("/evaluate-grapheme-test", evaluateResults);

export default router;
