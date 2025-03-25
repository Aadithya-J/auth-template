import express from 'express';
import { getTestsByChild, addTest6, addTest16,getSoundTestByChild } from '../controllers/testController.js';
// import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/getTestsByChild/:childId', getTestsByChild);
router.post('/addTest6', addTest6);
router.post('/addTest16', addTest16);
router.get('/getSoundTestByChild/:childId', getSoundTestByChild);
export default router; // ✅ Make sure to export as 'default'
// Compare this snippet from Backend/controllers/userController.js:
