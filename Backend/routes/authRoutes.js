import express from "express";
import {register,login,validateUser} from "../controllers/authController.js";
import e from "express";
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/validateUser', validateUser);

export default router;