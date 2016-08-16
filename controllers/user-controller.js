// models
var User = require('../models/user');

// Login user
exports.getLogin = function (req, res) { 
    res.render('login');
};

// Logout user
exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};

// Get list of students for course
exports.getStudentsByCourse = function (req, res) { 
    Course.findById(req.params.course).populate('students').exec(function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve any students at this time (" + err.message + ").");
        }
        res.status(200).send(course.students);
    });
};

// Import list of students for course
exports.importStudents = function (req, res) { 

    console.log(req.file);
};

// Retrieve list of students for tutorial
exports.getStudentsByTutorial = function (req, res) { };

// Add student in tutorial
exports.addStudentInTutorial = function (req, res) { };

// Delete student from tutorial
exports.deleteStudentInTutorial = function (req, res) { };

// Get files for user
exports.getFiles = function (req, res) { };

// Add files for user
exports.addFiles = function (req, res) { };

// Delete files for user
exports.deleteFiles = function (req, res) { };

// Get file for user
exports.getFile = function (req, res) { };

// Update file for user
exports.editFile = function (req, res) { };