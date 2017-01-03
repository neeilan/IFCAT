var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');

var models = require('.');

var TutorialSchema = new mongoose.Schema({
    number: { type: String, required: true },
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});
// Delete cascade
TutorialSchema.pre('remove', function (next) {
    var tutorial = this;
    var conditions = { 
        tutorials: { $in: [tutorial._id] }
    }, doc = { 
        $pull: { tutorials: tutorial._id }
    }, options = { 
        multi: true 
    };
    async.parallel([
        function deleteFromCourse(done) {
            models.Course.update(conditions, doc, options).exec(done);
        },
        function deleteTutorialQuiz(done) {
            models.TutorialQuiz.remove({ tutorial: tutorial._id }).exec(done);
        }
    ], next);
});
// Populate students
TutorialSchema.methods.withStudents = function () {
    return this.populate({ 
        path: 'students',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Check if student belongs to tutorial
TutorialSchema.methods.hasStudent = function (userId) {
    return this.students.indexOf(userId) > -1;
};
// Check if teaching assistant belongs to tutorial
TutorialSchema.methods.hasTeachingAssistant = function (userId) {
    return this.teachingAssistants.indexOf(userId) > -1;
};

module.exports = mongoose.model('Tutorial', TutorialSchema);