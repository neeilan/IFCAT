var mongoose = require('mongoose'),
    _ = require('lodash');

var TutorialQuizSchema = new mongoose.Schema({
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    active: { type: Boolean, default: false },
    published: { type: Boolean, default: false }
}, {
    timestamps: true 
});

TutorialQuizSchema.statics.findQuizzesByTutorial = function () {
    
};

module.exports = mongoose.model('TutorialQuiz', TutorialQuizSchema);