var mongoose = require('mongoose'),
    _ = require('lodash');

var QuizSchema = new mongoose.Schema({
    name: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Question' }],
    // number of points given per attempt
    // e.g. [4,2,1]  => 3 attempts possible: 
    // 4 points if answered correctly on 1st attempt, 2 points if answered on 2nd attempt, 
    // 1 point if answered correctly on 3rd attempt, no point otherwise 
    gradingScheme: [Number],
    randomizeChoices: Boolean,
    useLaTeX: Boolean
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Quiz', QuizSchema);