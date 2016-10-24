var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');

var models = require('../models');

// Retrieve list of students for course
exports.getStudentListByCourse = function (req, res) { 
    req.course.withTutorials().withStudents().execPopulate().then(function (err) {
        res.render('admin/course-students', {
            course: req.course
        });
    }); 
};
// Retrieve list of students matching search query
exports.getStudentListBySearchQuery = function (req, res) {
    models.User.findUsersBySearchQuery(req.query.q, 'student').exec(function (err, users) {
        res.render('admin/tables/course-students-search-results', { 
            course: req.course, 
            students: users
        });
    });
};
// Retrieve list of students for tutorial
exports.getStudentsByTutorial = function (req, res) { 
    req.tutorial.withStudents().execPopulate().then(function () {
        res.render('admin/tutorial-students', { 
            course: req.course, 
            tutorial: req.tutorial
        });
    });
};
// Add student to course
exports.addStudent = function (req, res) {
    req.course.update({ $addToSet: { students: req.us3r.id }}, function (err) {
        if (err) {
            req.flash('error', 'An error occurred while trying to remove student.');
        } else {
            req.flash('success', 'The student <b>%s</b> has been added into the course.', req.us3r.name.full);
        }
        res.json({ status: !!err });
    });
};
// Delete student from course and associated tutorial
exports.deleteStudent = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        async.waterfall([
            function deleteReferenceFromCourse(done) {
                req.course.update({ $pull: { students: req.us3r.id }}, done);
            },
            function deleteReferenceFromTutorial(course, done) {
                async.eachSeries(req.course.tutorials, function (tutorial, done) {
                    tutorial.update({ $pull: { students: req.us3r.id }}, done);
                }, done);
            }
        ], function (err) {
            if (err) {
                req.flash('error', 'An error occurred while trying to remove student.');
            } else {
                req.flash('success', 'The student <b>%s</b> has been removed from the course.', req.us3r.name.full);
            }
            res.json({ status: !!err });
        });
    });
};
// Import list of students
exports.importStudentList = function (req, res) {

    var course = req.course;
    // read spreadsheet
    csv.parse(req.file.buffer.toString(), {
        columns: true,
        delimiter: ',',
        skip_empty_lines: true
    }, function (err, rows) {
        /*if (err) {
            console.error(err);
            req.flash('error', 'An error occurred while trying to perform operation.');
            return;
        }*/
        async.eachSeries(rows, function (row, done) {
            row.UTORid = null;
            row.name = {};
            row.local = {};
            // normalize properties
            _.each(_.keys(row), function (key) {
                if (/^utorid/i.test(key)) {
                    row.UTORid = row[key];
                } else if (/^student/i.test(key)) {
                    row.studentNumber = row[key];
                } else if (/^first/i.test(key)) {
                    row.name.first = row[key];
                } else if (/^last/i.test(key)) {
                    row.name.last = row[key];
                } else if (/^e\-?mail/i.test(key)) {
                    row.local.email = row[key];
                } else if (/^password/i.test(key)) {
                    row.local.password = user.generateHash(row[key]);
                } else if (/^tutorial/i.test(key)) {
                    row.tutorial = row[key];
                }
            });

            async.waterfall([    
                function addStudent(done) {
                    models.User.saveStudent(row, done);
                },
                function addStudentIntoCourse(user, done) {
                    course.withTutorials().execPopulate().then(function () {
                        course.update({ $addToSet: { students: user.id }}, function (err) {
                            done(err, user);
                        });
                    });
                },
                function moveStudentIntoTutorial(user, done) {
                    async.eachSeries(course.tutorials, function (tutorial, done) {
                        if (_.toInteger(tutorial.number) === _.toInteger(row.tutorial)) {
                            tutorial.update({ $addToSet: { students: user.id }}, done);
                        } else {
                            tutorial.update({ $pull: { students: user.id }}, done);
                        }
                    }, done);
                }
            ], done);
        }, function (err) {
            if (err) {
                console.error(err);
                req.flash('error', 'An error occurred while trying to perform operation.');
            } else {
                req.flash('success', 'The students have been imported.');
            }
            res.redirect('/admin/courses/' + req.course.id + '/students');
        });
    });
};

exports.editStudentList = function (req, res) {
    var tutorials = {};
    // group user IDs by tutorial IDs
    _.each(req.body.tutorials, function (id, userId) {
        if (!tutorials.hasOwnProperty(id)) {
            tutorials[id] = [];
        }
        tutorials[id].push(userId);
    });
    // save
    req.course.withTutorials().execPopulate().then(function () {
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            var newStudents = [];
            if (tutorials.hasOwnProperty(tutorial.id)) {
                newStudents = tutorials[tutorial.id]; 
            }
            // check if changes were made
            if (_.difference(tutorial.students, newStudents)) {
                tutorial.update({ $set: { students: newStudents }}, done);
            } else {
                done();
            }
        }, function (err) {
            if (err) {
                console.error(err);
                req.flash('error', 'An error occurred while trying to perform operation.');
            } else {
                req.flash('success', 'The students have been updated.');
            }
            res.json({ status: !!err });
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
                // //console.log('tutorial', tutorials[0]);
                // //console.log('tutorialQuizzes', tutorialQuizzes);
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
    req.course.withTutorials().execPopulate().then(function () {
        // find tutorials that student is in
        var tutorial = _.find(req.course.tutorials, function (tutorial) {
            return tutorial.students.indexOf(req.us3r.id) !== -1;
        });
        // find tutorial quizzes
        if (tutorial) {
            models.TutorialQuiz.find({ tutorial: tutorial.id }).populate([{
                path: 'quiz',
                model: models.Quiz
            }, {
                path: 'groups',
                model: models.Group
            }, {
                path: 'responses',
                model: models.Response,
                populate: {
                    path: 'group',
                    model: models.Group
                }
            }]).exec(function (err, tutorialQuizzes) {
                // ugly: find marks by student
                var marks = _.map(tutorialQuizzes, function (tutorialQuiz) {
                    return {
                        tutorialQuiz: tutorialQuiz,
                        group: _.find(tutorialQuiz.groups, function (group) {
                            return group.members.indexOf(req.us3r.id) !== -1;
                        }),
                        points: _.reduce(tutorialQuiz.responses, function (sum, response) {
                            if (response.group.members.indexOf(req.us3r.id) !== -1) {
                                return sum + response.points;
                            }
                            return sum;
                        }, 0)
                    };
                });
                // tally the points
                var totalPoints = _.reduce(marks, function (sum, mark) {
                    return sum + mark.points;
                }, 0);

                res.render('admin/student-marks', {
                    student: req.us3r,
                    course: req.course,
                    tutorial: tutorial,
                    marks: marks,
                    totalPoints: totalPoints
                });
            });
        }
    });
};