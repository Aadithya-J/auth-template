const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollno: { type: String, required: true },
    age: { type: Number},
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the teacher
    tests_taken: { type: Number, default: 0 } 
}, { collection: 'Children' });

module.exports = mongoose.model('Child', childSchema);
