var Course = require('../models/course'),
    File = require('../models/file');

// Retrieve course
exports.getFile = function (req, res, next, fil3) {
    File.findById(fil3, function (err, fil3) {
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

// Retrieve all files in a course
exports.getFileList = function (req, res) {
    Course.populate(req.course, {
        path: 'files', options: { sort: { name: 1 }}
    }, function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any files at this time (" + err.message + ").");
        }*/
        res.render('admin/course-files', { course: course });
    });
};

// Retrieve specific file for file
exports.getFileForm = function (req, res) { 
    res.render('admin/course-file', { course: req.course, file: req.fil3 || new File() });
};

// Add new file for file
exports.addFile = function (req, res) {
    File.create({ 
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