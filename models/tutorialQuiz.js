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

// population methods

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