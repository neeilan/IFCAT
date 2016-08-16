var mongoose = require('mongoose'),
  Quiz = require('./quiz.js'),
  Schema = mongoose.Schema;

var GroupResponseSchema = new mongoose.Schema({
    students: [{ type: Schema.Types.ObjectId, ref : 'User' }],
    quiz: { type: Schema.Types.ObjectId, ref : 'Quiz' },
    responses: [Number], // Answer chosen for (i+1)th question, with i being index of quiz.questions (and this array)
    numberOfAttempts: [Number], // Number of attempts taken to answer (i+1)th question correctly
    score: Number
}, {
    timestamps: true
});

// GroupResponseSchema.methods.calculateScore = function(){
//   Quiz.findById(this.quiz, 'gradeByAttempt questions')
//     .populate('questions')
//     .exec()
//     .then((quiz)=>{
//       var studentScore = 0;
//       for (var i = 0; i < quiz.questions.length; i++){
//         /* If student skipped/didn't answer a question we assign 0
//         Note that a skipped question can be any falsy Js value
//         like null or false */
//         var attemptsNeeded = this.numberOfAttempts[i] || 0;
//         if (attemptsNeeded in quiz.scoreByAttempt)
//           studentScore += quiz.scoreByAttempt[attemptsNeeded];
//       }
//     return studentScore;
//   })
// }

module.exports = mongoose.model('GroupResponse', GroupResponseSchema);