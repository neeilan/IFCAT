const mongoose = require('mongoose');

let ResponseSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref : 'Question' },
    attempts: { type : Number, default: 0 },
    correct: Boolean,
    points: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Response', ResponseSchema);