var mongoose = require('mongoose');

var QuizSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);