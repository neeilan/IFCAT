var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');

var models = require('.');

var QuizSchema = new mongoose.Schema({
    name: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Question' }],
    // number of points given per attempt
    // e.g. [4,2,1]  => 3 attempts possible: 
    // 4 points if answered correctly on 1st attempt, 2 points if answered on 2nd attempt, 
    // 1 point if answered correctly on 3rd attempt, no point otherwise 
    gradingScheme: [Number],
    randomizeChoices: Boolean,
    useLaTeX: Boolean
}, { 
    timestamps: true
});

// populate questions
QuizSchema.methods.withQuestions = function () {
    return this.populate({
        path: 'quizzes', 
        options: { 
            sort: { name: 1 } 
        }
    });
};

// load quiz' tutorials
QuizSchema.methods.loadTutorials = function () {
    var quiz = this;
    return models.TutorialQuiz.find({ quiz: quiz }, 'tutorial').populate('tutorial').exec(function (err, tutorialQuizzes) {
        quiz.tutorialQuizzes = tutorialQuizzes.map(function (tutorialQuiz) { 
            return tutorialQuiz.tutorial.id;
        });
    });
};

// save quiz
QuizSchema.methods.store = function (obj, callback) {
    var quiz = this;
        quiz.name = obj.name;
        quiz.gradingScheme = obj.gradingScheme;
        quiz.randomizeChoices = obj.randomizeChoices;
        quiz.useLaTeX = obj.useLaTeX;

    async.series([
        // save quiz
        function (done) {
            quiz.save(done);
        },
        // get quiz' tutorials
        function (done) {
            quiz.loadTutorials().then(function () { done(); });
        },
        // delete old tutorials
        function (done) {
            async.eachSeries(_.difference(quiz.tutorials, obj.tutorials), function (tutorial, done) {
                models.TutorialQuiz.findOneAndRemove({ tutorial: tutorial, quiz: quiz }, done);
            }, done);
        },
        // insert new tutorials
        function (done) {
            async.eachSeries(_.difference(obj.tutorials, quiz.tutorials), function (tutorial, done) {
                models.TutorialQuiz.create({ tutorial: tutorial, quiz: quiz }, done);
            }, done);
        }
    ], function (err) {
        callback(null, quiz);
    });
};

module.exports = mongoose.model('Quiz', QuizSchema);