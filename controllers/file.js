var async = require('async'),
    moment = require('moment');

// models
var Course = require('../models/course'),
    File = require('../models/file');

// Retrieve all files in a course
exports.getFilesByCourse = function (req,res) {
    Course.findById(req.params.course).populate({
        path: 'files', options: { sort: { name: 1 }}
    }).exec(function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any files at this time (" + err.message + ").");
        }*/
        res.render('admin/files', { course: course, moment: moment });
    });
};

// Retrieve specific file for file
exports.getNewFileForm = function (req, res) { 
    Course.findById(req.params.course, function (err, course) {
        res.render('admin/file', { course: course, file: new File() });
    });
};

// Retrieve specific file for file
exports.getFileForm = function (req, res) { 
    async.series([
        function (cb) { Course.findById(req.params.course, cb); },
        function (cb) { File.findById(req.params.file, cb); }
    ], 
    function (err, results) {
        res.render('admin/file', { course: results[0], file: results[1] });
    });
};

// Add new file for file
exports.addFile = function (req, res) {
    async.waterfall([
        function (next) { 
            Course.findById(req.params.course, next); 
        },
        function (course, next) { 
            File.create({ 
                name: req.file.filename, 
                type: req.file.mimetype 
            }, function (err, file) { 
                next(err, course, file);
            });
        },
        function (course, file, next) { 
            course.files.push(file);
            course.save(function (err) {
                /*if (err) {
                    return res.status(500).send("Unable to save course at this time (" + err.message + ").");
                }*/
                next(null, course);
            }); 
        }
    ], 
    function (err, course) {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin/courses/' + course.id + '/files');
    });
};

// Update specific file for course
exports.editFile = function (req, res) {
    async.waterfall([
        function (next) { 
            Course.findById(req.params.course, next); 
        },
        function (course, next) { 
            File.findById(req.params.file, function (err, file) { 
                next(err, course, file);
            });
        },
        function (course, file, next) { 
            file.title = req.body.title;
            file.name = req.file.filename;
            file.type = req.file.mimetype;
            file.save(function (err, file) {
                next(err, course, file);
            });
        }
    ], 
    function (err, course, file) {
        res.redirect('/admin/courses/' + course.id + '/files/' + file.id + '/edit');
    });
};

// Delete specific file for course
exports.deleteFile = function (req, res) {
   /* 

   Course.findByIdAndUpdate(req.params.course, {
        $pull: { files: { _id: req.params.file } }
    }, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to delete file at this time (" + err.message + ").");
        }
        File.findByIdAndRemove(req.params.file, function (err, file) {
            if (err) {
                return res.status(500).send("Unable to delete file at this time (" + err.message + ").");
            }
            res.status(200).send({ 'responseText': 'The file has successfully deleted' });
        });
    });*/
};