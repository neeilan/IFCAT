var _ = require('lodash'),
    mongoose = require('mongoose');

var models = require('.');

var TutorialQuizSchema = new mongoose.Schema({
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    allocateMembers: { 
        type: String, 
        enum: ['unaided', 'automatically', 'manually'],
        default: 'automatically'
    },
    max: {
        groups: Number,
        membersPerGroup: Number
    },
    published: Boolean,
    locked: Boolean,
    active: Boolean,
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }]
}, {
    timestamps: true 
});

TutorialQuizSchema.index({ tutorial: 1, quiz: 1 }, { unique: true });

// get students not within groups
TutorialQuizSchema.virtual('unassignedStudents').get(function () {
    return _.reduce(this.groups, function (students, group) {
        return _.differenceWith(students, group.members, function (a, b) { return a.id === b.id; });
    }, this.tutorial.students);
});

// populate students
TutorialQuizSchema.methods.withStudents = function () {
    return this.populate({
        path: 'tutorial.students',
        model: models.User,
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};

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

// save tutorial-quiz
TutorialQuizSchema.methods.store = function (obj, callback) {
    this.allocateMembers = obj.allocateMembers;
    this.max = {};
    this.max[obj.max.key] = obj.max.value;
    this.active = obj.active;
    this.published = obj.published;
    this.save(callback);
};

// find quizzes within tutorial
TutorialQuizSchema.statics.findQuizzesByTutorial = function (tutorial) {
    return this.find({ tutorial: tutorial }).populate('quiz');
};

module.exports = mongoose.model('TutorialQuiz', TutorialQuizSchema);