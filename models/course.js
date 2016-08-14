var mongoose = require('mongoose'),
  Quiz = require('quiz');

var CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    courseCode: { type: String,  required: true, trim: true }
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }]
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
  }, {
    timestamps: true
});
CourseSchema.getAvailableQuizzes = function(){
  /* Returns a promise that resolves into the list of quizzes available to
  all students in the course  */
  return Quiz.find( { _id : { $in : this.quizzes }, availableToAll : true } ).exec();
}
module.exports = mongoose.model('CourseSchema', CourseSchema);
