var mongoose = require('mongoose'),
  Quiz = require('quiz');

var CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    courseCode: { type: String,  required: true, trim: true },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
  }, {
    timestamps: true
});

module.exports = mongoose.model('CourseSchema', CourseSchema);
