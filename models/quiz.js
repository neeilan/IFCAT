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

// population methods

QuizSchema.methods.withQuestions = function () {
    return this.populate({
        path: 'quizzes', 
        options: { 
            sort: { name: 1 } 
        }
    });
};

QuizSchema.methods.loadTutorials = function (idOnly) {
    var quiz = this;
    // find quiz' tutorials
    return models.TutorialQuiz.find({ quiz: quiz }, 'tutorial').populate('tutorial').exec(function (err, tutorialQuizzes) {
        console.log('err1', err);
        quiz.tutorials = tutorialQuizzes.map(function (tutorialQuiz) { 
            return idOnly ? tutorialQuiz.tutorial.id : tutorialQuiz.tutorial; 
        });
    });
};

QuizSchema.methods.store = function (obj, callback) {
    var quiz = this;
    
    quiz.name = obj.name;
    quiz.gradingScheme = obj.gradingScheme;
    quiz.randomizeChoices = obj.randomizeChoices;
    quiz.useLaTeX = obj.useLaTeX;

    async.series([
        // save quiz
        function (done) {
            console.log('save');
            quiz.save(done);
        },
        // get quiz' tutorials
        function (done) {
            console.log('get tutorials');
            quiz.loadTutorials(true).then(function () { done(); });
        },
        // delete old tutorials
        function (done) {
            console.log('old', _.difference(quiz.tutorials, obj.tutorials));
            async.eachSeries(_.difference(quiz.tutorials, obj.tutorials), function (tutorial, done) {
                models.TutorialQuiz.findOneAndRemove({ tutorial: tutorial, quiz: quiz }, done);
            }, done);
        },
        // insert new tutorials
        function (done) {
            console.log('new', _.difference(obj.tutorials, quiz.tutorials));
            async.eachSeries(_.difference(obj.tutorials, quiz.tutorials), function (tutorial, done) {
                models.TutorialQuiz.create({ tutorial: tutorial, quiz: quiz }, done);
            }, done);
        }
    ], function (err) {
        console.log('err2', err);
        callback(null, quiz);
    });
};

module.exports = mongoose.model('Quiz', QuizSchema);