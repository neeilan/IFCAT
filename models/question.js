var _ = require('lodash'),
    mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple choice', 'true or false', 'multiple select'/*, 'fill in the blanks'*/] },
    choices: [String],
    answers: [String],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}, { 
    timestamps: true 
});

// populate files
QuestionSchema.methods.withFiles = function () {
    return this.populate({ 
        path: 'files',
        options: {
            sort: { name: 1 }
        }
    });
};

// check if question is a multiple choice question
QuestionSchema.methods.isMultipleChoice = function () {
    return this.type === 'multiple choice';
};

// check if question is a true or false question
QuestionSchema.methods.isTrueOrFalse = function () {
    return this.type === 'true or false';
};

// check if question is a multiple select question
QuestionSchema.methods.isMultipleSelect = function () {
    return this.type === 'multiple select';
};

// check if question is a fill in the blanks question
QuestionSchema.methods.isFillInTheBlanks = function () {
    return this.type === 'fill in the blanks';
};


// check if question has file
QuestionSchema.methods.hasFile = function (id) {
    return this.files.indexOf(id) !== -1;
};

// check if question has nth-choice as an answer
QuestionSchema.methods.isAnswer = function (choice) {
    return this.answers.indexOf(choice) !== -1;
};

// save question
QuestionSchema.methods.store = function (obj, callback) {
    this.question = obj.question;
    this.type = obj.type;
    this.files = obj.files;
    this.choices = []; // clear previous choices
    this.answers = []; // clear previous answers

    var selected, key, matches, value, d;

    switch (this.type) {
        case 'multiple choice':
        case 'true or false':
        //case 'fill in the blanks':
            selected = obj.answer[_.kebabCase(this.type)];
            // add choices + answer
            for (d in obj.choices) {
                value = _.trim(obj.choices[d]);
                if (value) {
                    this.choices.push(value);
                    if (d === selected) {
                        this.answers = [value];
                    }
                }
            }
            break;
        case 'multiple select':
            selected = obj.answers[_.kebabCase(this.type)] || [];
            // add choices + answers
            for (d in obj.choices) {
                value = _.trim(obj.choices[d]);
                if (value) {
                    this.choices.push(value);
                    if (selected.indexOf(d) !== -1) {
                        this.answers.push(value);
                    }
                }
            }
            break;
        default:
            break;
    }

    return this.save(callback);
};

module.exports = mongoose.model('Question', QuestionSchema);