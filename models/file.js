var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('File', FileSchema);