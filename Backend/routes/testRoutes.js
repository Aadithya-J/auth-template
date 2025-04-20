import express from "express";
import {
  getTestsByChild,
  addTest6,
  addTest16,
  getSoundTestByChild,
  addTest13,
  getTest13ByChild,
} from "../controllers/testController.js";
// import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/getTestsByChild/:childId", getTestsByChild);
router.post("/addTest6", addTest6);
router.post("/addTest16", addTest16);
router.get("/getSoundTestByChild/:childId", getSoundTestByChild);
export default router;

router.post("/addTest13", addTest13);
router.get("/getTest13ByChild/:childId", getTest13ByChild);
