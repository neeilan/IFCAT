const mongoose = require('mongoose');
const ResponseSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref : 'Question' },
    group: { type: mongoose.Schema.Types.ObjectId, ref : 'Group' },
    attempts: { type : Number, default: 0 },
    lineByLineSummary : [{ attempts : { type : Number, default : 1 }, correct : Boolean}],
    codeTracingAnswers : [{type : String}],
    answer : [{type : String}],
    correct: Boolean,
    points: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Response', ResponseSchema);