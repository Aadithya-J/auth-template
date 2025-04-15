import express from 'express';
import { addSequenceTest, getSequenceTestsByUser } from '../controllers/sequenceController.js';

const router = express.Router();

// Add new sequence test result
router.post('/add-sequencetest', addSequenceTest);

// Get all sequence tests for a specific user
router.get('/user/:userId', getSequenceTestsByUser);

export default router;
