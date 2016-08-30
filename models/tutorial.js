var mongoose = require('mongoose'),
    _ = require('lodash');

var TutorialSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TutorialQuiz' }]
}, {
    timestamps: true
});

TutorialSchema.methods.getTUT = function () {
    return 'TUT ' + _.padStart(this.number, 4, '0');
};

module.exports = mongoose.model('Tutorial', TutorialSchema);