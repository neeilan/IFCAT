var mongoose = require('mongoose');

var TutorialQuizSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    active: { type: Boolean, default: false },
    published: { type: Boolean, default: false }
}, {
    timestamps: true 
});

module.exports = mongoose.model('TutorialQuiz', TutorialQuizSchema);