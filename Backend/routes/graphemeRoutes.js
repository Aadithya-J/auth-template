import { Router } from "express";
import {
  getTestResults,
  evaluateResponses
} from "../controllers/graphemeController.js";
const router = Router();

router.get("/getGraphemeByChild/:childId", getTestResults);
router.post("/evaluate-grapheme-responses", evaluateResponses);
export default router;
