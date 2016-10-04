var _ = require('lodash'),
    async = require('async');

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
    req.course.withFiles().execPopulate().then(function (err) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any files at this time (" + err.message + ").");
        }*/
        res.render('admin/course-files', { course: req.course });
    });
};
// Retrieve specific file
exports.getFileForm = function (req, res) {
    if (!req.fil3) {
        req.fil3 = new models.File();
    }
    res.render('admin/course-file', {
        title: req.fil3.isNew ? 'Add new file' : 'Edit file',
        course: req.course, 
        fil3: req.fil3
    });
};
// Add new files
exports.addFiles = function (req, res) {
    async.eachSeries(req.files, function (obj, done) {
        var fil3 = new models.File();
        fil3.store(obj, function (err) {
            req.course.files.push(fil3);
            req.course.save(done); 
        });
    }, function (err) {
        if (err) {
            req.flash('failure', 'Unable to save files at this time.');
        } else {
            req.flash('success', 'The files have been saved successfully.');
        }
        res.json({ status: true });
    });
};
// Update specific file for course
exports.editFile = function (req, res) {
    req.fil3.store(req, function (err) {
        if (err) {
            req.flash('failure', 'Unable to update file at this time.');
        } else {
            req.flash('success', 'The file has been updated successfully.');
        }
        res.redirect('/admin/courses/' + req.course.id + '/files/' + req.fil3.id + '/edit');
    });
};
// Delete specific file for course
exports.deleteFiles = function (req, res) {
    async.eachSeries(req.body.files, function (id, done) {
        models.File.findByIdAndRemove(id, done);
    }, function (err) {
        res.json({ status: true });
    });
};