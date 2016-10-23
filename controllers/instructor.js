var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve list of instructors for course
exports.getInstructorListByCourse = function (req, res) {
    req.course.withInstructors().execPopulate().then(function () {
        res.render('admin/course-instructors', { 
            title: 'Instructors',
            course: req.course
        });
    });
};
// Retrieve list of instructors matching search query
exports.getInstructorListBySearchQuery = function (req, res) {
    models.User.findUsersBySearchQuery(req.query.q, 'instructor').exec(function (err, users) {
        res.render('admin/tables/course-instructors-search-results', { 
            course: req.course, 
            instructors: users 
        });
    });
};
// Add instructor to course
exports.addInstructor = function (req, res) {
    req.course.update({ $addToSet: { instructors: req.us3r.id }}, function (err) {
        if (err) {
            req.flash('failure', 'An error occurred while trying to perform operation.');
        } else {
            req.flash('success', 'The instructor <b>' + req.us3r.name.full + '</b> has been added to the course.');
        }
        res.json({ status: true });
    });
};
// Delete instructor from course
exports.deleteInstructor = function (req, res) {    
    req.course.update({ $pull: { instructors: req.us3r.id }}, function (err) {
        if (err) {
            req.flash('failure', 'An error occurred while trying to perform operation.');
        } else {
            req.flash('success', 'The instructor <b>' + req.us3r.name.full + '</b> has been deleted from the course.');
        }
        res.json({ status: true });
    }); 
};