const express = require('express');
const { addVisual, getVisualByChild } = require('../controllers/visualController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a test for a child
router.post('/addVisual', verifyToken, addVisual);

// Get all tests for a specific child
router.get('/getVisualByChild/:childId', verifyToken, getVisualByChild);

module.exports = router;