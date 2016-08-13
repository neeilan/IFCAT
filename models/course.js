var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('CourseSchema', CourseSchema);