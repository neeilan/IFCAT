var mongoose = require('mongoose');

var QuizSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Question' }]
    //randomizeChoices: { type: Boolean, default: false },
    //availableToAll: { type: Boolean, default: false },
    //availableTo: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Tutorial' }], // complete
    //scoreByAttempt : [Number],  // score to assign if student answers correctly on (i + 1)th attempt (i being index)
    //groupResponses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupResponse' }],
    //responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);