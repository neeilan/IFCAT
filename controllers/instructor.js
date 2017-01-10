var util = require('util');
var _ = require('lodash'),
    async = require('async');
var config = require('../lib/config'),
    models = require('../models');

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
    models.User.findBySearchQuery(req.query.q, 'instructor').exec(function (err, instructors) {
        res.render('admin/tables/course-instructors-search-results', { 
            course: req.course, 
            instructors: instructors
        });
    });
};
// Add instructor to course
exports.addInstructorList = function (req, res) {
    async.each(req.body.instructors || [], function (instructor, done) {
        req.course.update({ $addToSet: { instructors: instructor }}, done);
    }, function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The instructors have been assigned to the course.');
        res.redirect('/admin/courses/' + req.course.id + '/instructors');
    });  
};
// Delete instructor from course
exports.deleteInstructor = function (req, res) {    
    req.course.update({ $pull: { instructors: req.us3r.id }}, function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Instructor <b>%s</b> has been deleted from the course.', req.us3r.name.full);
        res.sendStatus(200);
    }); 
};