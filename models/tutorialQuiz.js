var mongoose = require('mongoose'),
    _ = require('lodash');

var TutorialQuizSchema = new mongoose.Schema({
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    active: { type: Boolean, default: false },
    published: { type: Boolean, default: false }
}, {
    timestamps: true 
});

TutorialQuizSchema.methods.getStudentsWithGroups = function () {
    return _.reduce(this.groups, function (accum, group) {
        return _.union(accum, group.members);
    },  []);
};

TutorialQuizSchema.methods.getStudentsWithoutGroups = function () {
    return _.difference(this.getStudents(), this.getStudentsWithGroups());
};

module.exports = mongoose.model('TutorialQuiz', TutorialQuizSchema);