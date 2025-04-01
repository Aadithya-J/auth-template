import { Router } from "express";
import {
  addPicture,
  getPictureByChild,
} from "../controllers/pictureController.js";
const router = Router();

router.post("/addPicture", addPicture);

router.get("/getPictureByChild/:childId", getPictureByChild);

export default router;
