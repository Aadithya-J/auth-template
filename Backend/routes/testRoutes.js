const express = require('express');
const { addTest, getTestsByChild, test6, addTest6 } = require('../controllers/testController'); // Import test6 function
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a test for a child
router.post('/addTest', verifyToken, addTest);

// Get all tests for a specific child
router.get('/getTestsByChild/:childId', verifyToken, getTestsByChild);

// New test6 route
router.post('/addTest6', verifyToken, addTest6);

module.exports = router;
