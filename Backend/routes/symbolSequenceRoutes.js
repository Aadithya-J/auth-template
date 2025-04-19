import express from "express";
import {
  createResult,
  getResultsByChild,
} from "../controllers/symbolSequenceController.js";

const router = express.Router();

router.post("/symbolsequenceresults", createResult);
router.get("/symbolsequenceresults/:childId", getResultsByChild);

export default router;
