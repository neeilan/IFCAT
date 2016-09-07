var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String,  required: true },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}, {
    timestamps: true
});

CourseSchema.statics.findCourses = function (callback) {
    return this.find({}).sort('code');
};

CourseSchema.statics.findCoursesByStudent = function (id, callback) {
    return this.find({ 'students': { $in: [id] } }, callback);
};

module.exports = mongoose.model('Course', CourseSchema);