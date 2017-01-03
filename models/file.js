var async = require('async'),
    mongoose = require('mongoose');

var models = require('.');

var FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String
}, {
    timestamps: true
});
// Delete cascade
FileSchema.pre('remove', function (next) {
    var conditions = { files: { $in: [this._id] }},
        doc = { $pull: { files: this._id }},
        options = { multi: true };
    async.parallel([
        function deleteFromCourse(done) {
            models.Course.update(conditions, doc, options).exec(done);
        },
        function deleteFromQuestion(done) {
            models.Question.update(conditions, doc, options).exec(done);     
        }
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
FileSchema.methods.store = function (obj, callback) {
    this.name = obj.filename;
    this.type = obj.mimetype;
    return this.save(function (err) {
        callback(err);
    });
};

module.exports = mongoose.model('File', FileSchema);