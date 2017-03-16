var _ = require('lodash'),
    mongoose = require('mongoose');
var models = require('.');

var TutorialQuizSchema = new mongoose.Schema({
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
    // whether members will be unaided in picking their groups, will be automatically placed into groups,
    // or will manually be placed into groups by the admins
    allocateMembers: { 
        type: String, 
        enum: ['unaided', 'automatically', 'self-selection'], // incorrect!
        default: 'automatically'
    },
    // max # of groups OR members per group
    max: {
        groups: { type : Number, default: 4 },
        membersPerGroup: { type : Number, default: 3 } 
    },
    // make quiz visible to students
    published: Boolean,
    // allow students to do quiz
    active: Boolean,
    // allow students to see their quiz results
    archived: Boolean
}, {
    timestamps: true 
});
// Set index
TutorialQuizSchema.index({ tutorial: 1, quiz: 1 }, { unique: true });
// Populate students
TutorialQuizSchema.methods.withStudents = function () {
    return this.populate({
        path: 'tutorial.students',
        model: models.User,
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate groups
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
// Populate responses
TutorialQuizSchema.methods.withResponses = function () {
    return this.populate({
        path: 'responses',
        model: models.Response,
        populate: [{
            path: 'group',
            model: models.Group
        }, {
            path: 'question',
            models: models.Question
        }]
    });
};
// Save tutorial-quiz
TutorialQuizSchema.methods.store = function (obj, callback) {
    this.allocateMembers = obj.allocateMembers;
    this.max = {};
    this.max[obj.max.key] = obj.max.value;
    return this.save(callback);
};
// Find quizzes within tutorial
TutorialQuizSchema.statics.findQuizzesByTutorial = function (tutorial) {
    return this.find({ tutorial: tutorial }).populate('tutorial quiz');
};

module.exports = mongoose.model('TutorialQuiz', TutorialQuizSchema);