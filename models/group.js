const _ = require('lodash'),
    mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teachingPoints: [String]
});
// Populate responses
GroupSchema.virtual('responses', { ref: 'Response', localField: '_id', foreignField: 'group' });
// Check if user belongs to group
GroupSchema.methods.hasMember = function (userId) {
    return this.members.indexOf(userId) > -1;
};
// Tally the points from populated responses
GroupSchema.methods.getTotalPoints = function () {
    return _.sumBy(this.responses, response => response.points)
};

module.exports = mongoose.model('Group', GroupSchema);