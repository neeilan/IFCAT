var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String }
}, {
    timestamps: true
});

FileSchema.methods.isAudio = function () {
    return this.type.indexOf('audio') !== -1;
};

FileSchema.methods.isImage = function () {
    return this.type.indexOf('image') !== -1;
};

module.exports = mongoose.model('File', FileSchema);