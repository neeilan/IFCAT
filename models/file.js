var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('File', FileSchema);