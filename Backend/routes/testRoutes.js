const express = require('express');
const { addTest, getTestsByChild } = require('../controllers/testController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a test for a child
router.post('/addTest', verifyToken, addTest);

// Get all tests for a specific child
router.get('/getTestsByChild/:childId', verifyToken, getTestsByChild);

module.exports = router;