var _ = require('lodash'),
    mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    number: String,
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple choice', 'multiple select', 'fill in the blanks'] },
    choices: [String],
    answers: [String],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    links: [String],
    shuffleChoices: Boolean,
    useLaTeX: Boolean,
    points: Number,
    firstTryBonus: Number,
    penalty: Number
}, { 
    timestamps: true 
});
// Populate files
QuestionSchema.methods.withFiles = function () {
    return this.populate({ 
        path: 'files',
        options: {
            sort: { name: 1 }
        }
    });
};
// Check if question is a multiple choice question
QuestionSchema.methods.isMultipleChoice = function () {
    return this.type === 'multiple choice';
};
// Check if question is a multiple select question
QuestionSchema.methods.isMultipleSelect = function () {
    return this.type === 'multiple select';
};
// Check if question is a fill in the blanks question
QuestionSchema.methods.isFillInTheBlanks = function () {
    return this.type === 'fill in the blanks';
};
// Check if question has file with given ID
QuestionSchema.methods.hasFile = function (id) {
    return this.files.indexOf(id) !== -1;
};
// Check if given choice is one of the answers
QuestionSchema.methods.isAnswer = function (choice) {
    return this.answers.indexOf(choice) !== -1;
};
// Save question
QuestionSchema.methods.store = function (obj, callback) {
    this.number = obj.number;
    this.question = obj.question;
    this.type = obj.type;
    this.files = obj.files;
    this.links = _.filter(obj.links, Boolean);
    this.shuffleChoices = !!obj.shuffleChoices;
    this.useLaTeX = !!obj.useLaTeX;
    this.points = obj.points;
    this.firstTryBonus = obj.firstTryBonus;
    this.penalty = obj.penalty;
    // clear previous choices and answers
    this.choices = []; 
    this.answers = [];

    var selected, key, matches, value, d;

    if (this.isMultipleChoice()) {
        selected = _.isObject(obj.answer) ? obj.answer[_.kebabCase(this.type)] : false;
        // add choices and selected answer
        for (d in obj.choices) {
            value = _.trim(obj.choices[d]);
            if (value) {
                this.choices.push(value);
                // mark as the answer if selected
                if (d === selected) {
                    this.answers = [value];
                }
            }
        }
    } else if (this.isMultipleSelect()) {
        selected = _.isObject(obj.answers) ? obj.answers[_.kebabCase(this.type)] : [];
        // add choices + selected answers
        for (d in obj.choices) {
            value = _.trim(obj.choices[d]);
            if (value) {
                this.choices.push(value);
                // mark as one of answers if selected
                if (selected.indexOf(d) !== -1) {
                    this.answers.push(value);
                }
            }
        }
    } else if (this.isFillInTheBlanks()) {
        for (d in obj.choices) {
            value = _.trim(obj.choices[d]);
            if (value) {
                this.choices.push(value);
                this.answers.push(value);
            }
        }
    }
    return this.save(callback);
};

module.exports = mongoose.model('Question', QuestionSchema);