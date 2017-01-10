var url = require('url');
var _ = require('lodash'),
    mongoose = require('mongoose');
var models = require('.');

var QuestionSchema = new mongoose.Schema({
    number: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple choice', 'multiple select', 'short answer'] },
    choices: [String],
    answers: [String],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    links: [String],
    caseSensitive: Boolean,
    shuffleChoices: Boolean,
    useLaTeX: Boolean,
    points: Number,
    firstTryBonus: Number,
    penalty: Number
}, { 
    timestamps: true 
});
// Delete cascade
QuestionSchema.pre('remove', function (next) {
    var conditions = { questions: { $in: [this._id] }},
        doc = { $pull: { questions: this._id }},
        options = { multi: true };
    models.Quiz.update(conditions, doc, options).exec(next);
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
// Check if question is a short answer question
QuestionSchema.methods.isShortAnswer = function () {
    return this.type === 'short answer';
};
// Check if question has file with given ID
QuestionSchema.methods.hasFile = function (id) {
    return this.files.indexOf(id) > -1;
};
// Check if given choice is one of the answers
QuestionSchema.methods.isAnswer = function (choice) {
    return this.answers.indexOf(choice) > -1;
};
// Save question
QuestionSchema.methods.store = function (obj, callback) {
    this.number = _.trim(obj.number);
    this.question = _.trim(obj.question);
    this.type = obj.type;
    this.files = obj.files;
    this.links = [];
    this.choices = []; 
    this.answers = [];
    this.caseSensitive = !!obj.caseSensitive;
    this.shuffleChoices = !!obj.shuffleChoices;
    this.useLaTeX = !!obj.useLaTeX;
    this.points = obj.points;
    this.firstTryBonus = obj.firstTryBonus;
    this.penalty = obj.penalty;
    
    var selected, key, matches, question = this;

    _.each(obj.links, function (value) {
        value = _.trim(value);
        // add unique links
        if (value) {
            if (!url.parse(value).protocol)
                value = 'http://' + value;
            if (question.links.indexOf(value) === -1)
                question.links.push(value);
        }
    });

    if (this.isMultipleChoice()) {
        selected = _.isObject(obj.answer) ? obj.answer[_.kebabCase(this.type)] : false;
        _.forOwn(obj.choices, function (value, i) {
            value = _.trim(value);
            // add unique choices
            if (value && question.choices.indexOf(value) === -1) {
                question.choices.push(value);
                // mark as the answer if selected
                if (i === selected)
                    question.answers = [value];
            }
        });
    } else if (this.isMultipleSelect()) {
        selected = _.isObject(obj.answers) ? obj.answers[_.kebabCase(this.type)] : [];
        _.forOwn(obj.choices, function (value, i) {
            value = _.trim(value);
            // add unique choices
            if (value && question.choices.indexOf(value) === -1) {
                question.choices.push(value);
                // mark as one of answers if selected
                if (selected.indexOf(i) > -1)
                    question.answers.push(value);
            }
        });
    } else if (this.isShortAnswer()) {
        _.forOwn(obj.choices, function (value) {
            value = _.trim(value);
            // add unique choices
            if (value && question.choices.indexOf(value) === -1) {
                question.choices.push(value);
                question.answers.push(value);
            }
        });
    }
    return this.save(callback);
};

module.exports = mongoose.model('Question', QuestionSchema);