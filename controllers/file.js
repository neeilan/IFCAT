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
    res.render('admin/course-file', { course: req.course, fil3: req.fil3 || new models.File() });
};
// Add new file
exports.addFile = function (req, res) {
    models.File.create({ 
        name: req.file.filename, 
        type: req.file.mimetype 
    }, function (err, file) { 
        req.course.files.push(file);
        req.course.save(function (err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/courses/' + req.course.id + '/files');
        }); 
    });
};
// Update specific file for course
exports.editFile = function (req, res) {
    req.fil3.name = req.file.filename;
    req.fil3.type = req.file.mimetype;
    req.fil3.save(function (err) {
        res.redirect('/admin/courses/' + req.course.id + '/files/' + req.fil3.id + '/edit');
    });
};
// Delete specific file for course
exports.deleteFile = function (req, res) {
    req.fil3.remove(function (err) {
        res.json({ status: true });
    })
};