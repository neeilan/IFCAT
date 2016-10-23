var fs = require('fs');

var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');

var models = require('../models');

// Retrieve file
exports.getFile = function (req, res, next, fil3) {
    models.File.findById(fil3, function (err, fil3) {
        if (err) {
            return next(err);
        }
        if (!fil3) {
            return next(new Error('No file is found.'));
        }
        console.log('got fil3');
        req.fil3 = fil3; // careful: req.file is used by multer
        next();
    });
};
// Retrieve all files in the course
exports.getFileList = function (req, res) {
    req.course.withFiles().execPopulate().then(function () {
        res.render('admin/course-files', { 
            title: 'Files',
            course: req.course
        });
    });
};
// Retrieve specific file
/*exports.getFileForm = function (req, res) {
    if (!req.fil3) {
        req.fil3 = new models.File();
    }
    res.render('admin/course-file', {
        title: req.fil3.isNew ? 'Add new file' : 'Edit file',
        course: req.course, 
        fil3: req.fil3
    });
};*/
// Add new files
exports.addFiles = function (req, res) {
    async.eachSeries(req.files, function (obj, done) {
        var file = new models.File();
        async.waterfall([
            // add file to collection
            function (done) {
                file.store(obj, done);
            },
            // add reference to course
            function (done) {
                req.course.update({ $push: { files: file.id }}, done);
            }
        ], done);
    }, function (err) {
        if (err) {
            console.error(err);
            req.flash('failure', 'An error occurred while trying to save the files.');
        } else {
            req.flash('success', 'The files have been saved successfully.');
        }
        res.json({ status: true });
    });
};
// Update specific file for course
/*exports.editFile = function (req, res) {
    req.fil3.store(req, function (err) {
        if (err) {
            req.flash('failure', 'Unable to update file at this time.');
        } else {
            req.flash('success', 'The file has been updated successfully.');
        }
        res.redirect('/admin/courses/' + req.course.id + '/files/' + req.fil3.id + '/edit');
    });
};*/
// Delete specific files from course
exports.deleteFiles = function (req, res) {
    var prePath = __dirname + '/../public/upl/' + req.course.id + '/';
    async.each(req.body.files, function (id, done) {
        async.waterfall([
            // delete file reference from course
            function (done) {
                req.course.update({ $pull: { files: id }}, done);
            },
            // delete file from collection
            function (file, done) {
                models.File.findByIdAndRemove(id, done);
            },
            // delete file from filesystem
            function (file, done) {
                var path = prePath + file.name;
                fs.stat(path, function (err, stats) {
                    if (err) {
                        return done(err);
                    } else if (stats.isFile()) {
                        fs.unlink(path, done);
                    } else {
                        return done();
                    }
                });
            }
        ], done);
    }, function (err) {
        if (err) {
            console.error(err);
            req.flash('failure', 'An error occurred while trying to delete the files.');
        } else {
            req.flash('success', 'The files have been deleted successfully.');
        }
        res.json({ status: true });
    });
};

// Retrieve a file by Id
exports.getFileLinkById = function (req,res){
    models.Course.findOne({ files : req.params.id }).exec()
    .then(function(course){
        models.File.findById(req.params.id).exec()
        .then(function(file){
            var fileUrl = '/upl/' + course._id + '/' + file.name;
            res.redirect(fileUrl);
        });      
    });
};