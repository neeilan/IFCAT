var _ = require('lodash'),
    mongoose = require('mongoose');

var models = require('.');

var TutorialQuizSchema = new mongoose.Schema({
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    active: { type: Boolean, default: false },
    published: { type: Boolean, default: false }
}, {
    timestamps: true 
});

TutorialQuizSchema.index({ tutorial: 1, quiz: 1 }, { unique: true });

// get tutorial number
TutorialQuizSchema.virtual('number').get(function () {
    return this.tutorial.number;
});

// get quiz name
TutorialQuizSchema.virtual('name').get(function () {
    return this.quiz.name;
});

// populate groups
TutorialQuizSchema.methods.withGroups = function () {
    return this.populate({
        path: 'groups',
        model: models.Group,
        populate: [{
            path: 'members',
            model: models.User,
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }, {
            path: 'driver'
        }]
    });
};

module.exports = mongoose.model('TutorialQuiz', TutorialQuizSchema);