var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    number: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    representative: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Group', GroupSchema);
