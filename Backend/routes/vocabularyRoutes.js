import express from 'express';
import {
  evaluateVocabularyAndStore,
  getVocabularyTestResultById,
  getVocabularyTestsByChild,
  getVocabularyWords
} from '../controllers/vocabularyController.js';

const router = express.Router();

router.get('/words', getVocabularyWords);

router.post('/submit', evaluateVocabularyAndStore);

router.get('/results/:id', getVocabularyTestResultById);

router.get('/results/child/:childId', getVocabularyTestsByChild);

export default router;
