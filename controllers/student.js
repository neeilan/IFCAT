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
    req.tutorial.withStudents().execPopulate().then(function () {
        res.render('admin/tutorial-students', { course: req.course, tutorial: req.tutorial });
    });
};
// Add student to course
exports.addStudent = function (req, res) {
    req.course.addStudent(req.us3r.id);
    req.course.save(function (err) {
        res.json({ status: true });
    });
};
// Update student in tutorial
exports.editStudent = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        // ugly: move student in tutorial
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
// Import list of students
exports.importStudents = function (req, res) {
    // read spreadsheet
    csv.parse(req.file.buffer.toString(), {
        columns: true,
        delimiter: ',',
        skip_empty_lines: true
    }, function (err, rows) {
        async.eachSeries(rows, function (row, done) {
            async.waterfall([
                // add student if they do not already exist
                function (done) {
                    // check if user exist already with UTORid
                    models.User.findUserByUTOR(row.UTORid).then(function (user) {
                        // if user does not already exist, create them
                        if (!user) {
                            user = new models.User();
                            user.UTORid = row.UTORid;
                            user.local.email = row.email;
                            user.name.first = row.first;
                            user.name.last = row.last;
                            user.local.password = user.generateHash(row.password);
                        }
                        // mark them as student
                        user.addRole('student');
                        user.save(function (err) {
                            done(err, user);
                        });
                    });
                },
                // add student into course if they are not already
                function (user, done) {
                    req.course.withTutorials().execPopulate().then(function () {
                        req.course.addStudent(user);
                        req.course.save(function (err) {
                            done(err, user);
                        });
                    });
                },
                // ugly: move student into tutorial if they are not already
                function (user, done) {
                    async.eachSeries(req.course.tutorials, function (tutorial, done) {
                        if (_.toInteger(tutorial.number) !== _.toInteger(row.tutorial)) {
                            tutorial.deleteStudent(user.id);
                        } else {
                            tutorial.addStudent(user.id);
                        }
                        tutorial.save(done);
                    }, function (err) {
                        done(err, user);
                    });
                }
            ], done);
        }, function (err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/courses/' + req.course.id + '/students');
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
            return (tutorial.students.indexOf(req.user.id) > -1);
        });
        // find tutorial quizzes
        if (tutorials) {
            models.TutorialQuiz.find({ tutorial: tutorials[0].id, published: true }).populate('quiz').exec(function (err, tutorialQuizzes) {
                // console.log('tutorial', tutorials[0]);
                // console.log('tutorialQuizzes', tutorialQuizzes);
                res.render('student/tutorial-quizzes', { 
                    course: req.course,
                    tutorial: tutorials[0],
                    tutorialQuizzes: tutorialQuizzes 
                });
            });
        }
    });
};
// 
exports.getMarks = function (req, res) {
    
};