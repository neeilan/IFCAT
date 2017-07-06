const _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
    teachingPoints: [String]
});
// Delete cascade
GroupSchema.pre('remove', function (next) {
    let self = this;
    async.parallel([
        done => self.model('TutorialQuiz').update({ groups: { $in: [self._id] }}, { $pull: { groups: self._id }}, done)
    ], next);
});
// Methods
GroupSchema.methods.hasMember = function (userId) {
    return this.members.indexOf(userId) > -1;
};
GroupSchema.methods.getTotalPoints = function () {
    return _.sumBy(this.responses, response => response.points)
};

module.exports = mongoose.model('Group', GroupSchema);