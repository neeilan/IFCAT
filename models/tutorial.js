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
// Delete cascade
/*TutorialSchema.pre('remove', function (next) {
    var conditions = { tutorials: { $in: [this._id] }},
        doc = { $pull: { tutorials: this._id }},
        options = { multi: true };
    models.Tutorial.update(conditions, doc, options).exec();
    models.TutorialQuiz.remove({ tutorial: this._id }).exec();
    next();
});*/
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
    return this.students.indexOf(userId) !== -1;
};
// Check if teaching assistant belongs to tutorial
TutorialSchema.methods.hasTeachingAssistant = function (userId) {
    return this.teachingAssistants.indexOf(userId) !== -1;
};

module.exports = mongoose.model('Tutorial', TutorialSchema);