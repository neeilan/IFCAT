const _ = require('lodash'),
    async = require('async'),
    models = require('.'),
    mongoose = require('mongoose');
const QuizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    default: {
        question: {
            shuffleChoices: Boolean,
            useLaTeX: Boolean,
            points: { type: Number, default : 4 },
            firstTryBonus: { type : Number, default : 1 },
            penalty: { type : Number, default : 1 }
        }
    },
    studentChoice: { type: Boolean, default: false },
    votable: { type: Boolean, default: false }
}, {
    timestamps: true
});
// Delete cascade
QuizSchema.pre('remove', function (next) {
    let self = this;
    async.parallel([
        done => models.Course.update({ quizzes: { $in: [self._id] }}, { $pull: { quizzes: self._id }}, done),
        done => models.Question.remove({ _id: { $in: self.questions }}, done),
        done => models.TutorialQuiz.remove({ quiz: self._id }, done)
    ], next);
});
// Populate tutorial-quizzes
QuizSchema.virtual('tutorialQuizzes', { ref: 'TutorialQuiz', localField: '_id', foreignField: 'quiz' });
// Populate questions
QuizSchema.methods.withQuestions = function () {
    return this.populate({ path: 'questions', options: { sort: { number: 1 }}});
};
// 
QuizSchema.methods.isLinkedTo = function (tutorialId) {
    return _.some(this.tutorialQuizzes, tutorialQuiz => tutorialQuiz.tutorial.equals(tutorialId));
}
// Save quiz
QuizSchema.methods.linkTutorials = function (tutorials = [], done) {
    let self = this;
    async.series([
        done => {
            self.populate({
                path: 'tutorialQuizzes',
                match: {
                    tutorial: { $nin: tutorials }
                }
            }, done)
        },
        done => {
            //console.log('deleting', self.tutorialQuizzes)
            models.TutorialQuiz.remove({ _id: { $in: self.tutorialQuizzes }}, done)
        },
        done => {
            //console.log('adding', tutorials)
            async.eachSeries(tutorials, (tutorial, done) => {
                models.TutorialQuiz.findOne({ quiz: self._id, tutorial: tutorial }, (err, tutorialQuiz) => {
                    if (err)
                        return done(err);
                    if (tutorialQuiz)
                        return done();
                    //console.log('adding', tutorial)
                    models.TutorialQuiz.create({ quiz: self, tutorial: tutorial }, done);
                });
            }, done);
        }
    ], done);
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

module.exports = mongoose.model('Quiz', QuizSchema);