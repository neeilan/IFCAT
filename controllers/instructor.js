const _ = require('lodash'),
    async = require('async'),
    config = require('../lib/config'),
    models = require('../models'),
    util = require('util');

// Retrieve list of instructors for course
exports.getInstructorsByCourse = (req, res) => {
    req.course.withInstructors().execPopulate().then(() => {
        res.render('admin/course-instructors', { 
            bodyClass: 'instructors',
            title: 'Instructors',
            course: req.course
        });
    });
};
// Retrieve list of instructors matching search query
exports.getInstructorsBySearchQuery = (req, res) => {
    models.User.findBySearchQuery({ q: req.query.q, role: 'instructor' }, (err, instructors) => {
        res.render('admin/tables/course-instructors-search-results', { 
            course: req.course, 
            instructors: instructors
        });
    });
};
// Add instructor to course
exports.addInstructors = (req, res) => {
    req.course.update({ $addToSet: { instructors: { $each: req.body.instructors || [] }}}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The instructors have been assigned to the course.');
        res.redirect(`/admin/courses/${req.course.id}/instructors`);
    });  
};
// Delete instructor from course
exports.deleteInstructor = (req, res) => {
    req.course.update({ $pull: { instructors: req.us3r.id }}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Instructor <b>%s</b> has been deleted from the course.', req.us3r.name.full);
        res.sendStatus(200);
    }); 
};