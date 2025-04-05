import { Router } from "express";
import {
  evaluateDescriptionAndStore,
  getPictureByChild,
  getPictureTestResults,
} from "../controllers/pictureController.js";
const router = Router();

router.get("/getPictureByChild/:childId", getPictureByChild);
router.post("/evaluate-picture-test", evaluateDescriptionAndStore);
router.get("/picture-test-results/:id", getPictureTestResults);

export default router;
