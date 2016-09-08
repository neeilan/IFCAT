var _ = require('lodash'),
    mongoose = require('mongoose');

var models = require('.');

var TutorialSchema = new mongoose.Schema({
    number: { type: String, required: true },
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

TutorialSchema.methods.loadQuizzes = function (callback) {
    var tutorial = this;
    // find tutorial's quizzes
    return models.TutorialQuiz.find({ tutorial: tutorial }, 'quiz').populate('quiz').exec(function (err, tutorialQuizzes) {
        tutorial.quizzes = tutorialQuizzes.map(function (tutorialQuiz) { 
            return tutorialQuiz.quiz; 
        });
    });
};

module.exports = mongoose.model('Tutorial', TutorialSchema);