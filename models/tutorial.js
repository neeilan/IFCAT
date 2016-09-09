var _ = require('lodash'),
    mongoose = require('mongoose');

var models = require('.');

var TutorialSchema = new mongoose.Schema({
    number: { type: String, required: true },
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Tutorial', TutorialSchema);