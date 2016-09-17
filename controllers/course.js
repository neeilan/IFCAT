var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve course
exports.getCourse = function (req, res, next, course) {
    models.Course.findById(course, function (err, course) {
        if (err) {
            return next(err);
        }
        if (!course) {
            return next(new Error('No course is found.'));
        }
        console.log('got course');
        req.course = course;
        next();
    });
};
// Retrieve many courses
exports.getCourseList = function (req, res) {
    if (req.user.hasRole('admin')) {
        models.Course.findCourses().exec(function (err, courses) { 
            res.render('admin/courses', { title: 'Courses', courses: courses });
        });
    } else {
        async.series([
            function (done) {
                models.Course.findCoursesByInstructor(req.user.id).exec(done);
            },
            function (done) {
                models.Course.findCoursesByTeachingAssistant(req.user.id).exec(done);
            }
        ], function (err, results) {
            res.render('admin/courses', { 
                'instructor.courses': results[0],
                'teachingAssistant.courses': results[1] 
            });
        });
    }
};
// Get form for course
exports.getCourseForm = function (req, res) {
    var course = req.course || new models.Course();
    res.render('admin/course', { title: course.isNew ? 'Add course' : 'Edit course', course: course });
};
// Add course
exports.addCourse = function (req, res) {
    models.Course.create(req.body, function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to save course at this time (" + err.message + ").");
        }*/
        res.redirect('/admin/courses');
    });
};
// Update course
exports.editCourse = function (req, res) {
    _.extend(req.course, req.body).save(function (err) {  
        /*if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }*/
        res.redirect('/admin/courses/' + req.course.id + '/edit');
    });
};
// Delete course
exports.deleteCourse = function (req, res) {}; 