var mongoose = require('mongoose'),
    _ = require('lodash');

var QuizSchema = new mongoose.Schema({
    name: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Question' }],
    //tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Tutorial' }],
    settings: {
        // number of points given per attempt
        // e.g. [4,2,1]  => 3 attempts possible: 
        // 4 points if answered correctly on 1st attempt, 2 points if answered on 2nd attempt, 
        // 1 point if answered correctly on 3rd attempt, no point otherwise 
        gradingScheme: [Number],
        randomizeChoices: Boolean,
        useLaTeX: Boolean
    }
}, { 
    timestamps: true 
});

QuizSchema.methods.setDefault = function (parent) {
    for (var prop in this.settings) {
        var value = this.settings[prop];
        // overwrite undefined, null, [] values
        if (_.isEmpty(value) && !_.isInteger(value) && !_.isBoolean(value)) {
            this.settings[prop] = parent.settings[prop];
        }
    }
};

module.exports = mongoose.model('Quiz', QuizSchema);