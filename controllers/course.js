// models
var Course = require('../models/course'),
    User = require('../models/user');

// Retrieve many courses
exports.getCourses = function (req, res) {
    if (req.user.hasRole('admin')) {
        Course.find({}).sort('code').exec(function (err, courses) { 
            res.render('admin/courses', { courses: courses });
        });
    } /*else if (req.user.hasRole('instructor')) {
        User.findById(req.user.id).populate({
            path: 'instructor.courses', options: { code: { code: 1 } }
        }).exec(function (err, user) { 
            res.render('admin/courses', { courses: user.instructor.courses });
        });
    } else if (req.user.hasRole('teachingAssistant')) {
        User.findById(req.user.id).populate({
            path: 'teachingAssistant.courses', options: { sort: { code: 1 } }
        }).exec(function (err, user) {
            res.render('admin/courses', { courses: user.teachingAssistant.courses });
        });
    } else {
        User.findById(req.user.id).populate({
            path: 'student.courses', options: { sort: { code: 1 } }
        }).exec(function (err, user) {
            res.render('student/courses', { courses: user.student.courses });
        });
    }*/
};

// Retrieve course by code
exports.getNewCourseForm = function (req, res) {
    res.render('admin/course', { course: new Course() });
};

// Retrieve course by code
exports.getCourseForm = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        /* if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }
        if (!course) {
            return res.status(404).send("This course doesn't exist.");
        } */
        res.render('admin/course', { course: course });
    });
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
    Course.findByIdAndUpdate(req.params.course, { $set: req.body }, { new: true }, function (err, course) {  
        /*if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }*/
        res.redirect('/admin/courses/' + course.id + '/edit');
    });
};

// Delete course
exports.deleteCourse = function (req, res) {
    Course.findByIdAndRemove(req.params.course, function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to delete course at this time (" + err.message + ").");
        }*/
        res.redirect('/admin/courses');
    });
};