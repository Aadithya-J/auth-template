import { Router } from 'express';
import { addChild, getChild, getChildrenByTeacher } from '../controllers/childController.js';

const router = Router();

// Add a child
router.post('/addChild', addChild);

router.get("/getChild/:childId", getChild);

// Get all children for a teacher
router.get('/getChildrenByTeacher', getChildrenByTeacher);

export default router;