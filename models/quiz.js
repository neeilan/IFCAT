var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');

var models = require('.');

var QuizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // note: questions are sorted in the order that they are arranged 
    // i.e. [0] => 1st question, [1] => 2nd question, etc
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    shuffleChoices: Boolean,
    useLaTeX: Boolean,
    points: { type: Number, default : 4 },
    firstTryBonus: { type : Number, default : 1 },
    penalty: { type : Number, default : 1 }
}, { 
    timestamps: true
});
// Delete cascade
QuizSchema.pre('remove', function (next) {
    var quiz = this;
    async.parallel([
        function deleteFromCourse(done) {
            models.Course.update({ quizzes: { $in: [quiz._id] }}, { $pull: { quizzes: quiz._id }}).exec(done);
        },
        function deleteQuestions(done) {
            models.Question.remove({ _id: { $in: quiz.questions }}).exec(done);
        },
        function deleteTutorialQuiz(done) {
            models.TutorialQuiz.remove({ quiz: quiz._id }).exec(done);
        }
    ], next);
});
// populate questions
QuizSchema.methods.withQuestions = function () {
    return this.populate('questions');
};
// Load quiz' tutorials (deprecated)
QuizSchema.methods.loadTutorials = function () {
    var quiz = this;
    return models.TutorialQuiz.find({ quiz: quiz }).populate('tutorial').exec(function (err, tutorialQuizzes) {
        quiz.tutorials = tutorialQuizzes.map(function (tutorialQuiz) { 
            return tutorialQuiz.tutorial.id;
        });
    });
};
// Save quiz
QuizSchema.methods.store = function (obj, callback) {
    this.name = obj.name;
    this.gradingScheme = obj.gradingScheme;
    this.shuffleChoices = !!obj.shuffleChoices;
    this.useLaTeX = !!obj.useLaTeX;
    this.points = obj.points;
    this.firstTryBonus = obj.firstTryBonus;
    this.penalty = obj.penalty;

    var quiz = this, newTutorials = obj.tutorials || [];

    // console.log('new', newTutorials)

    async.series([
        function save(done) {
            quiz.save(done);
        },
        // bug: deleting tutorial quiz is unrecoverable; so to ensure data integrity, 
        // tutorial-quizzes that have been started i.e. have groups or responses cannot be deleted
        function deleteTutorialQuizzes(done) {
            models.TutorialQuiz.find({ 
                $and: [
                    { 'quiz': quiz.id }, 
                    { 'groups.0': { '$exists': false } },
                    { 'responses.0': { '$exists': false } }
                ]
            }).exec(function (err, tutorialQuizzes) {
                async.eachSeries(tutorialQuizzes, function (tutorialQuiz, done) {
                    if (newTutorials.indexOf(tutorialQuiz.tutorial.toString()) === -1)
                        tutorialQuiz.remove(done);
                    else
                        done();
                }, done);
            });
        },
        function addTutorialQuizzes(done) {
            models.TutorialQuiz.find({ 'quiz': quiz.id }).exec(function (err, tutorialQuizzes) {
                var oldTutorials = _.map(tutorialQuizzes, function (tutorialQuiz) {
                    return tutorialQuiz.tutorial.toString();
                });

                // console.log('old', oldTutorials)

                async.eachSeries(_.difference(newTutorials, oldTutorials), function (id, done) {
                    models.TutorialQuiz.create({ tutorial: id, quiz: quiz.id }, done);
                }, done);
            });
        }
    ], function (err) {
        callback(err, quiz);
    });
};

module.exports = mongoose.model('Quiz', QuizSchema);