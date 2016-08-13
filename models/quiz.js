var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var QuizSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    questions: [ { type: Schema.Types.ObjectId, ref : 'Question' } ],
    randomizeChoices: Boolean,
    availableTo: [ { type: Schema.Types.ObjectId, ref : 'Tutorial' } ]  // complete
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);
