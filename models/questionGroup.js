const _ = require('lodash'),
    async = require('async'),
    models = require('.'),
    mongoose = require('mongoose'),
    url = require('url');

let QuestionGroupSchema = new mongoose.Schema({
    number: { type: String, required: true },
    header: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, {
    timestamps: true 
});
// Delete cascade
QuestionGroupSchema.pre('remove', function (next) {
    var self = this;
    async.series([
        done => models.Quiz.update({ 
            questions: { $in: [self._id] }
        }, { 
            $pull: { 
                questionGroups: self._id,
                order: {
                    type: 'QuestionGroup',
                    id: self._id
                }
            }
        }, { 
            multi: true 
        }).exec(done),
        done => models.Response.remove({ question: self._id }).exec(done),
    ], next);
});


module.exports = mongoose.model('Question', QuestionGroupSchema);