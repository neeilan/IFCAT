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
    var self = this;
    async.parallel([
        function deleteFromQuiz(done) {
            models.Quiz.update({ questions: { $in: [self._id] }}, { $pull: { questions: self._id }}, { multi: true }).exec(done);
        },
        function deleteResponses(done) {
            models.Response.remove({ question: self._id }).exec(done);
        }
    ], next);
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
    this.files = obj.files || [];
    this.links = [];
    this.choices = []; 
    this.answers = [];
    this.caseSensitive = !!obj.caseSensitive;
    this.shuffleChoices = !!obj.shuffleChoices;
    this.useLaTeX = !!obj.useLaTeX;
    this.points = obj.points;
    this.firstTryBonus = obj.firstTryBonus;
    this.penalty = obj.penalty;
    
    var selected, key, matches, self = this;

    _.each(obj.links, function (link) {
        link = _.trim(link);
        if (link) {
            if (!url.parse(link).protocol)
                link = 'http://' + link;
            if (self.links.indexOf(link) === -1)
                self.links.push(link);
        }
    });

    if (this.isMultipleChoice()) {
        selected = _.isObject(obj.answer) ? obj.answer[_.kebabCase(this.type)] : false;
        _.forOwn(obj.choices, function (choice, i) {
            choice = _.trim(choice);
            // add unique choices
            if (choice && self.choices.indexOf(choice) === -1) {
                self.choices.push(choice);
                // mark as the answer if selected
                if (i === selected)
                    self.answers = [choice];
            }
        });
    } else if (this.isMultipleSelect()) {
        selected = _.isObject(obj.answers) ? obj.answers[_.kebabCase(this.type)] : [];
        _.forOwn(obj.choices, function (choice, i) {
            choice = _.trim(choice);
            // add unique choices
            if (choice && self.choices.indexOf(choice) === -1) {
                self.choices.push(choice);
                // mark as one of answers if selected
                if (selected.indexOf(i) > -1)
                    self.answers.push(choice);
            }
        });
    } else if (this.isShortAnswer()) {
        _.forOwn(obj.choices, function (choice) {
            choice = _.trim(choice);
            // add unique choices
            if (choice && self.choices.indexOf(choice) === -1) {
                self.choices.push(choice);
                self.answers.push(choice);
            }
        });
    }
    return this.save(callback);
};

module.exports = mongoose.model('Question', QuestionSchema);