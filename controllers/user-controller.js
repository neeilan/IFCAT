var _ = require('underscore');

// models
var User = require('../models/user');

// Login user
exports.login = function (req, res) { };

// Logout user
exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};

// Get list of students for course
exports.getStudentsByCourse = function (req, res) { };

// Import list of students for course
exports.importStudents = function (req, res) { };

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