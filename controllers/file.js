var async = require('async'),
    fs = require('fs-extra'),
    mongoose = require('mongoose');

var config = require('../lib/config'),
    models = require('../models');

// Retrieve file
exports.getFile = function (req, res, next, file) {
    models.File.findById(file, function (err, file) {
        if (err) {
            return next(err);
        }
        if (!file) {
            return next(new Error('No file is found.'));
        }
        req.fil3 = file; // careful: req.file is used by multer
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
// Add new files
exports.addFiles = function (req, res) {
    async.eachSeries(req.files, function (obj, done) {
        var file = new models.File();
        file.store(obj, function (err) {
            if (err)
                return done(err);
            req.course.update({ $push: { files: file.id }}, done);
        });
    }, function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The files have been added.');
        res.json({ status: !err });
    });
};
// Delete specific files from course
exports.deleteFiles = function (req, res) {
    var dir = config.uploadPath + '/' + req.course.id;
    async.each(req.body.files, function (id, done) {
        async.waterfall([
            function find(done) {
                models.File.findById(id, done);
            },
            function del(file, done) {
                file.remove(function (err) {
                    if (err)
                        done(err);
                    done(null, file);
                });
            },
            function unlink(file, done) {
                var path = dir + '/' + file.name;
                fs.stat(path, function (err, stats) {
                    if (err && err.code === 'ENOENT')
                        done();
                    else if (err)
                        done(err);
                    else if (stats.isFile())
                        fs.remove(path, done);
                    else
                        done();
                });
            }
        ], done);
    }, function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The files have been deleted.');
        res.json({ status: !err });
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