const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true }, // Reference to the child
    test_name: { type: String, required: false },
    reading_age: { type: Number, default: 0 },  // Customize these fields as per test type
    score: { type: Number },
    correct_words: [ {type: [String], default: []}], // Array of correct words
    incorrect_words: { type: [String], default: [] }, // Array of incorrect words
    date_taken: { type: Date, default: Date.now } // Field for date and time
}, { collection: 'Tests' });

module.exports = mongoose.model('Test', testSchema);
