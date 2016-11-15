var util = require('util');

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
    models.User.findBySearchQuery(req.query.q, 'instructor').exec(function (err, instructors) {
        res.render('admin/tables/course-instructors-search-results', { 
            course: req.course, 
            instructors: _.filter(instructors, function (instructor) {
                return req.course.instructors.indexOf(instructor.id) === -1;
            })
        });
    });
};
// Add instructor to course
exports.addInstructor = function (req, res) {
    req.course.update({ $addToSet: { instructors: req.us3r.id }}, function (err) {
        if (err)
            return res.status(500).send('An error occurred while trying to perform operation.');
        res.send(util.format('Instructor <b>%s</b> has been added to the course.', req.us3r.name.full));
    });
};
// Delete instructor from course
exports.deleteInstructor = function (req, res) {    
    req.course.update({ $pull: { instructors: req.us3r.id }}, function (err) {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform operation.');
        } else {
            req.flash('success', 'Instructor <b>%s</b> has been deleted from the course.', req.us3r.name.full);
        }
        res.json({ status: !err });
    }); 
};