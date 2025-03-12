const express = require('express');
const { addChild, getChild, getChildrenByTeacher } = require('../controllers/childController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a child
router.post('/addChild', verifyToken, addChild);

router.get("/getChild/:childId", verifyToken, getChild);

// Get all children for a teacher
router.get('/getChildrenByTeacher', verifyToken, getChildrenByTeacher);

module.exports = router;
