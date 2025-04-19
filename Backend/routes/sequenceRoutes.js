import express from "express";
import {
  addSequenceTest,
  getSequenceTestsByUser,
} from "../controllers/sequenceController.js";

const router = express.Router();

router.post("/addsequencetest", addSequenceTest);

router.get("/getSequenceTestsByUser/:userId", getSequenceTestsByUser);

export default router;
