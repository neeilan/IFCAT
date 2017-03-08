var _ = require('lodash'),
    async = require('async');
var models = require('../models');

// Retrieve course
exports.getCourse = function (req, res, next, course) {
    models.Course.findById(course, function (err, course) {
        if (err)
            return next(err);
        if (!course)
            return next(new Error('No course is found.'));
        req.course = course;
        next();
    });
};
// Retrieve many courses
exports.getCourseList = function (req, res) {
    models.Course.find().sort('code').exec(function (err, courses) {
        res.render('admin/courses', { 
            title: 'Courses',
            courses: _.filter(courses, function (course) {
                return req.user.hasRole('admin') || 
                    course.instructors.indexOf(req.user.id) !== -1 || 
                    course.teachingAssistants.indexOf(req.user.id) !== -1; 
            }) 
        });
    });
};
// Get form for course
exports.getCourseForm = function (req, res) {
    var course = req.course || new models.Course();
    res.render('admin/course', { 
        title: course.isNew ? 'Add New Course' : 'Edit Course',
        course: course 
    });
};
// Add course
exports.addCourse = function (req, res) {
    models.Course.create(req.body, function (err, course) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been created.', course.name);
        res.redirect('/admin/courses');
    });
};
// Update course
exports.editCourse = function (req, res) {
    req.course.set(req.body).save(function (err) {  
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been updated.', req.course.name);
        res.redirect('/admin/courses/' + req.course.id + '/edit');
    });
};
// Delete course
exports.deleteCourse = function (req, res) {
    req.course.remove(function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been deleted.', req.course.name);   
        res.sendStatus(200);
    });
};