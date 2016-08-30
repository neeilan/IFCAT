var _ = require('lodash');

var Course = require('../models/course'),
    Quiz = require('../models/quiz'),
    User = require('../models/user');

// Retrieve course
exports.getCourse = function (req, res, next, course) {
    Course.findById(course, function (err, course) {
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

// ROUTES

// Retrieve many courses
exports.getCourseListForAdmin = function (req, res) {
    if (req.user.hasRole('admin')) {
        Course.find({}).sort('code').exec(function (err, courses) { 
            res.render('admin/courses', { courses: courses });
        });
    } else {
        Course.find({
            $or: [
                { 'instructors': { $in: [req.user.id] } }, 
                { 'teachingAssistants': { $in: [req.user.id] } }
            ], 
            $sort: { 
                code: 1 
            } 
        }, function (err, courses) { 
            res.render('admin/courses', { courses: courses });
        });
    }
};

exports.getCourseListForStudent = function (req, res) {
    Course.find({ 
        'students': { 
            $in: [req.user.id]
        }
    }, function (err, courses) { 
        res.render('student/courses', { courses: courses });
    });
};

//
exports.getCourseForm = function (req, res) {
    res.render('admin/course', { course: req.course || new Course() });
};

// Add course model
exports.addCourse = function (req, res) {
    Course.create(req.body, function (err, course) {
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
exports.deleteCourse = function (req, res) {
    /*req.course.delete(function (err) {
        if (err) {
            return res.status(500).send("Unable to delete course at this time (" + err.message + ").");
        }
        res.redirect('/admin/courses');
    });*/
}; 