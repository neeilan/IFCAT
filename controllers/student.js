var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');

var models = require('../models');

// Retrieve list of students for course
exports.getStudentListByCourse = function (req, res) { 
    req.course.withTutorials().withStudents().execPopulate().then(function (err) {
        res.render('admin/course-students', { course: req.course });
    }); 
};
// Retrieve list of students matching search query
exports.getStudentListBySearchQuery = function (req, res) {
    models.User.findUsersBySearchQuery(req.query.q, 'student').exec(function (err, users) {
        res.render('admin/course-students-search-results', { course: req.course, users: users });
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
        res.render('admin/tutorial-students', { course: req.course, tutorial: req.tutorial });
    }); 
    console.log(req.course.students, req.us3r.id);
    req.course.addStudent(req.us3r.id);
    console.log(req.course.students, req.us3r.id);
    req.course.save(function (err) {
        res.json({ status: true });
    });
};

// Add student to course
exports.addStudent = function (req, res) {

    console.log(req.course.students, req.us3r.id);
    req.course.addStudent(req.us3r.id);
    console.log(req.course.students, req.us3r.id);
    req.course.save(function (err) {
        res.json({ status: true });
    });
};

// Update student in tutorials
exports.editStudent = function (req, res) {
     req.course.withTutorials().execPopulate().then(function () {
        // update student in tutorial
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            if (!req.body.tutorial[req.us3r.id] || req.body.tutorial[req.us3r.id] !== tutorial.id) {
                tutorial.deleteStudent(req.us3r.id);
            } else {
                tutorial.addStudent(req.us3r.id);
            }
            tutorial.save(done);
        }, function (err) {
            res.json({ status: true });
        });
    });
};
// Delete student from course and associated tutorial
exports.deleteStudent = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        // remove student from tutorial
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            tutorial.deleteStudent(req.us3r.id);
            tutorial.save(done);
        // remove student from course
        }, function (err) {
            req.course.deleteStudent(req.us3r.id);
            req.course.save(function (err) {
                res.json({ status: true });
            });
        });
    });  
};

// TO-FIX!

// Retrieve courses enrolled for student
exports.getCourseList = function (req, res) {
    models.Course.findCoursesByStudent(req.user.id).exec(function (err, courses) { 
        res.render('student/courses', { courses: courses });
    });
};
// Retrieve quizzes within course
exports.getQuizList = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        // find tutorials that student is in
        var tutorials = req.course.tutorials.filter(function (tutorial) {
            return tutorial.students.indexOf(req.user.id);
        });
        // find tutorial quizzes
        if (tutorials) {
            models.TutorialQuiz.find({ tutorial: tutorials[0].id, published: true }).populate('quiz').exec(function (err, tutorialQuizzes) {
                console.log('tutorial', tutorials[0]);
                console.log('tutorialQuizzes', tutorialQuizzes);
                res.render('student/tutorial-quizzes', { 
                    course: req.course,
                    tutorial: tutorials[0],
                    tutorialQuizzes: tutorialQuizzes 
                });
            });
        }
    });
};