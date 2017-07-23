const _ = require('lodash'),
    mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teachingPoints: [String]
});
// Populate tutorial-quizzes
GroupSchema.virtual('responses', { ref: 'Response', localField: '_id', foreignField: 'group' });
// Methods
GroupSchema.methods.hasMember = function (userId) {
    return this.members.indexOf(userId) > -1;
};
GroupSchema.methods.getTotalPoints = function () {
    return _.sumBy(this.responses, response => response.points)
};

module.exports = mongoose.model('Group', GroupSchema);