import { Router } from 'express';
import { submitResults,getContinuousAssessmentResultsByChildId } from '../controllers/continuousAssessment.js';

const router = Router();

router.post('/continuous-assessment/submit', submitResults);
router.get('/continuous-assessment/getByChildId/:child_id', getContinuousAssessmentResultsByChildId);
export default router;