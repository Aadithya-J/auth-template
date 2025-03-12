const express = require('express');
const { saveUserData, getUserData } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Define your routes
router.post('/saveUserData', verifyToken, saveUserData);
router.get('/getUserData', verifyToken, getUserData);

module.exports = router;
