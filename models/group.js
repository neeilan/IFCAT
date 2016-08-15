var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupResponse' }],
  });

module.exports = mongoose.model('GroupSchema', GroupSchema);
