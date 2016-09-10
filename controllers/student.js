var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');

var models = require('../models');

// Retrieve list of students for course
exports.getStudentsByCourse = function (req, res) { 
    models.Course.populate(req.course, [{
        path: 'tutorials'
    }, { 
        path: 'students', 
        options: { 
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }], function (err, course) {
        course.students = course.students.map(function (student) {
            // add tutorial for each student
            course.tutorials.filter(function (tutorial) {
                if (tutorial.students.indexOf(student.id) !== -1) {
                    student.tutorial = tutorial;
                    return true;
                }
                return false;
            });
            return student;
        });
        res.render('admin/course-students', { course: req.course });
    }); 
};

// Retrieve list of students for tutorial
exports.getStudentsByTutorial = function (req, res) { 
    models.Tutorial.populate(req.tutorial, { 
        path: 'students',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }, function (err) {
        res.render('admin/students', { course: req.course, tutorial: req.tutorial });
    }); 
};