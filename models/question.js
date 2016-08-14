var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    // quiz:
    text: { type: String, required: true, trim: true },
    correctAnswers: Array,
    choices: [ { choiceNumber: Number, text: String } ],
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);
