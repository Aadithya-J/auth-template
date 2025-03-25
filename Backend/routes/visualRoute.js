import { Router } from 'express';
import { addVisual, getVisualByChild, } from '../controllers/visualController.js';

const router = Router();

// Add a test for a child
router.post('/addVisual',addVisual);

// Get all tests for a specific child
router.get('/getVisualByChild/:childId',getVisualByChild);
export default router;