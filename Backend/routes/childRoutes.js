import { Router } from 'express';
import { addChild, getChild, getChildrenByTeacher } from '../controllers/childController.js';

const router = Router();

router.post('/addChild', addChild);

router.get("/getChild/:childId", getChild);

router.get('/getChildrenByTeacher', getChildrenByTeacher);

export default router;