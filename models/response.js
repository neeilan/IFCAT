var mongoose = require('mongoose'),
  Quiz = require('./quiz.js'),
  Schema = mongoose.Schema;

var ResponseSchema = new mongoose.Schema({
    student: { type: Schema.Types.ObjectId, ref : 'User' },
    quiz: { type: Schema.Types.ObjectId, ref : 'Quiz' },
    responses: [Number], // Answer chosen for (i+1)th question, with i being index of quiz.questions (and this array)
    numberOfAttempts: [Number], // Number of attempts taken to answer (i+1)th question correctly
    score: Number
}, {
    timestamps: true
});



module.exports = mongoose.model('Response', ResponseSchema);