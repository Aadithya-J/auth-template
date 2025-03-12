const Test = require('../models/test');
const Child = require('../models/child');
const Visual = require("../models/visual")

exports.addVisual = async (req, res) => {
    const { child_id, options } = req.body; // Add correctWords and incorrectWords to the body
    // console.log(child_id, options);
    
    try {
        const test = new Visual({
            child_id,
            options
        });
        
        await test.save();
        
        // Increment the number of tests taken by the child
        await Child.findByIdAndUpdate(child_id, {
            $inc: { tests_taken: 1 }
        });
        
        // console.log(test);
        res.status(201).json({ message: 'Visual Discrimination Test added successfully', test });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Get all tests for a specific child
exports.getVisualByChild = async (req, res) => {
    const { childId } = req.params;

    try {
        const tests = await Visual.find({ child_id: childId });
        res.status(200).json({ tests });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
