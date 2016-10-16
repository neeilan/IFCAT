var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve list of instructors for course
exports.getInstructorListByCourse = function (req, res) {
    req.course.withInstructors().execPopulate().then(function (err) {
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
    req.course.addInstructor(req.us3r.id);
    req.course.save(function (err) {
        res.json({ status: true });
    });
};
// Delete instructor from course
exports.deleteInstructor = function (req, res) {
    // remove instructor from course    
    req.course.deleteInstructor(req.us3r.id);
    req.course.save(function (err) {
        res.json({ status: true });
    }); 
};