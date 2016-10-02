var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teachingPoints: [String]
});

GroupSchema.statics.findGroupByMember = function (userId) {
    return this.findOne({
        'members': { 
            $in: [userId] 
        } 
    });
};

module.exports = mongoose.model('Group', GroupSchema);
