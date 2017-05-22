const async = require('async'),
    models = require('.'),
    mongoose = require('mongoose');

let FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String
}, {
    timestamps: true
});
// Delete cascade
FileSchema.pre('remove', function (next) {
    var self = this;
    async.series([
        done => models.Course.update({ files: { $in: [self._id] }}, { $pull: { files: self._id }}, done),
        done => models.Question.update({ files: { $in: [self._id] }}, { $pull: { files: self._id }}, { multi: true }, done)
    ], next);
});
// Check if file is an audio
FileSchema.methods.isAudio = function () {
    return this.type.indexOf('audio') > -1;
};
// Check if file is an image
FileSchema.methods.isImage = function () {
    return this.type.indexOf('image') > -1;
};
// Save file 
FileSchema.methods.store = function (obj) {
    this.name = obj.filename;
    this.type = obj.mimetype;
    return this;
};

module.exports = mongoose.model('File', FileSchema);