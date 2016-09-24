var mongoose = require('mongoose');

var ResponseSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref : 'Group' },
    question: { type: mongoose.Schema.Types.ObjectId, ref : 'Question' },
    attempts: { type : Number , default: 1 },
    correct: Boolean,
    points: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Response', ResponseSchema);