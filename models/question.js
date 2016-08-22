var mongoose = require('mongoose');

var options = { 
    discriminatorKey: 'type', 
    timestamps: true 
};

var QuestionSchema = new mongoose.Schema({
    question: { 
        type: String, 
        required: true, 
        trim: true 
    },
    files: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'File' }
    ],
    useLaTeX: { 
        type: Boolean,
        default: false
    },
    randomizeChoices: { 
        type: Boolean,
        default: true
    }
}, options);

var Question = mongoose.model('Question', QuestionSchema);

var MultipleChoiceQuestion = Question.discriminator('MultipleChoice', new mongoose.Schema({
    choices: Array,
    answers: Array
}, options));

var TrueOrFalseQuestion = Question.discriminator('TrueOrFalse', new mongoose.Schema({
    choices: Array,
    answer: Number
}, options));


module.exports = {
    Generic: Question,
    MultipleChoice: MultipleChoiceQuestion,
    TrueOrFalse: TrueOrFalseQuestion
};