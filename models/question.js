var _ = require('lodash'),
    mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple choice', 'true or false', 'multiple select'/*, 'fill in the blanks'*/] },
    choices: [String],
    answers: [Number],
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

// save question
QuestionSchema.methods.store = function (obj, callback) {
    this.question = obj.question;
    this.type = obj.type;
    this.files = obj.files;
    this.choices = []; // clear previous choices
    this.answers = []; // clear previous answers
    this.useLaTeX = obj.useLaTeX;

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
                        this.answers = [this.choices.length - 1];
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
                        this.answers.push(this.choices.length - 1);
                    }
                }
            }
            break;
        default:
            break;
    }

    this.save(callback);
};

module.exports = mongoose.model('Question', QuestionSchema);