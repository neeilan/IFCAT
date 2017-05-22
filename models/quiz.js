const _ = require('lodash'),
    async = require('async'),
    models = require('.'),
    mongoose = require('mongoose');

let QuizSchema = new mongoose.Schema({
    name: { type: String, required: true },
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
    let self = this;
    async.series([
        done => models.Course.update({ quizzes: { $in: [self._id] }}, { $pull: { quizzes: self._id }}, done),
        done => models.Question.remove({ _id: { $in: self.questions }}, done),
        done => models.TutorialQuiz.remove({ quiz: self._id }, done)
    ], next);
});
// populate questions
QuizSchema.methods.withQuestions = function () {
    return this.populate('questions');
};
// Load quiz' tutorials (deprecated)
QuizSchema.methods.loadTutorials = function () {
    let quiz = this;
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

    let quiz = this, newTutorials = obj.tutorials || [];

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
                let oldTutorials = _.map(tutorialQuizzes, function (tutorialQuiz) {
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