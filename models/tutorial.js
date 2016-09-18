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
TutorialSchema.methods.addTeachingAssistant = function (user) {
    if (this.teachingAssistants.indexOf(user) === -1) {
        this.teachingAssistants.push(user);
    }
};
// Add student
TutorialSchema.methods.addStudent = function (user) {
    if (this.students.indexOf(user) === -1) {
        this.students.push(user);
    }
};
// Delete teaching assistant
TutorialSchema.methods.deleteTeachingAssistant = function (user) {
    var index = this.teachingAssistants.indexOf(user);
    if (index !== -1) {
        this.teachingAssistants.splice(index, 1);
    }
};
// Delete student
TutorialSchema.methods.deleteStudent = function (user) {
    var index = this.students.indexOf(user);
    if (index !== -1) {
        this.students.splice(index, 1);
    }
};

module.exports = mongoose.model('Tutorial', TutorialSchema);