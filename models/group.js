var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupResponse' }],
  });

module.exports = mongoose.model('Group', GroupSchema);
