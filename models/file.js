var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String
}, {
    timestamps: true
});
// Check if file is an audio
FileSchema.methods.isAudio = function () {
    return this.type.indexOf('audio') !== -1;
};
// Check if file is an image
FileSchema.methods.isImage = function () {
    return this.type.indexOf('image') !== -1;
};
// Save file 
FileSchema.methods.store = function (obj, callback) {
    this.name = obj.filename;
    this.type = obj.mimetype;
    return this.save(callback);
};

module.exports = mongoose.model('File', FileSchema);