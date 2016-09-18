var mongoose = require('mongoose');

var ResponseSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref : 'Group' },
    question: { type: mongoose.Schema.Types.ObjectId, ref : 'Question' },
    attempts: Number,
    correct: Boolean,
    points: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Response', ResponseSchema);