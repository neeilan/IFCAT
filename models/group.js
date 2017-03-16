var _ = require('lodash'),
    mongoose = require('mongoose');
var models = require('.');

var GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teachingPoints: [String]
});

GroupSchema.methods.hasMember = function (userId) {
    return this.members.indexOf(userId) > -1;
};

module.exports = mongoose.model('Group', GroupSchema);