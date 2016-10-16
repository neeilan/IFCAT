var _ = require('lodash'),
    mongoose = require('mongoose');

var models = require('.');

var TutorialSchema = new mongoose.Schema({
    number: { type: String, required: true },
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
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
// Add teaching assistant
TutorialSchema.methods.addTeachingAssistant = function (userId) {
    if (this.teachingAssistants.indexOf(userId) === -1) {
        this.teachingAssistants.push(userId);
    }
};
// Add student
TutorialSchema.methods.addStudent = function (userId) {
    if (this.students.indexOf(userId) === -1) {
        this.students.push(userId);
    }
};
// Delete teaching assistant
TutorialSchema.methods.deleteTeachingAssistant = function (userId) {
    var index = this.teachingAssistants.indexOf(userId);
    if (index !== -1) {
        this.teachingAssistants.splice(index, 1);
    }
};
// Delete student
TutorialSchema.methods.deleteStudent = function (userId) {
    var index = this.students.indexOf(userId);
    if (index !== -1) {
        this.students.splice(index, 1);
    }
};
// Check if student belongs to tutorial
TutorialSchema.methods.hasStudent = function (userId) {
    return this.students.indexOf(userId) !== -1;
};
// Check if teaching assistant belongs to tutorial
TutorialSchema.methods.hasTeachingAssistant = function (userId) {
    return this.teachingAssistants.indexOf(userId) !== -1;
};

module.exports = mongoose.model('Tutorial', TutorialSchema);