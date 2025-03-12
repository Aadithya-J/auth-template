const User = require('../models/user');


// Save user data controller
const saveUserData = async (req, res) => {
    const { userData } = req.body;
    const userId = req.userId; // Extracted from verifyToken middleware

    if (!userData) {
        return res.status(400).json({ message: 'userData is required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Push new userData object into user.data array
        user.data.push(userData);
        await user.save();

        res.status(200).json({ message: 'User data saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get user data controller
const getUserData = async (req, res) => {
    const userId = req.userId; // Extracted from verifyToken middleware

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            email: user.email,
            data: user.data
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    saveUserData,
    getUserData
};
