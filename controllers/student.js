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
exports.addStudent = function (req, res) { //console.log(req.us3r.id);
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
            if (err) {
                req.flash('failure', 'An error occurred while trying to update student.');
            } else {
                req.flash('success', 'The student has been updated successfully.');
            }
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
            //console.log(req.course.students, req.us3r.id);
            req.course.deleteStudent(req.us3r.id);
            req.course.save(function (err) {
                if (err) {
                    req.flash('failure', 'An error occurred while trying to remove student.');
                } else {
                    req.flash('success', 'The student has been removed successfully from course.');
                }
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
                    //console.log('find')
                    // check if user exist already with UTORid
                    models.User.findUserByUTOR(row.utorid).then(function (us3r) {
                        // if user does not already exist, create them
                        if (!us3r) {
                            //console.log('new')
                            us3r = new models.User();
                            us3r.UTORid = row.UTORid;
                            us3r.name.first = row['First Name'];
                            us3r.name.last = row['Last Name'];
                            if (row.Email) {
                                us3r.local.email = row.Email;
                            }
                            if (row.Password) {
                                us3r.local.password = us3r.generateHash(row.Password);
                            }
                        }
                        //console.log('add student role')
                        // mark them as student
                        us3r.addRole('student');
                        us3r.save(function (err) {
                            done(err, us3r);
                        });
                    });
                },
                // add student into course if they are not already
                function (us3r, done) {
                    req.course.withTutorials().execPopulate().then(function () {
                        req.course.addStudent(us3r);
                        req.course.save(function (err) {
                            //console.log('add student into course')
                            done(err, us3r);
                        });
                    });
                },
                // ugly: move student into tutorial if they are not already
                function (us3r, done) {
                    async.eachSeries(req.course.tutorials, function (tutorial, done) {
                        if (_.toInteger(tutorial.number) === _.toInteger(row.Tutorial)) {
                            tutorial.addStudent(us3r.id);
                        } else {
                            tutorial.deleteStudent(us3r.id);
                        }
                        //console.log('move student into tutorial')
                        tutorial.save(done);
                    }, function (err) {
                        //console.log('done')
                        done(err, us3r);
                    });
                }
            ], done);
        }, function (err) {
            //console.log('done all')
            if (err) {
                req.flash('failure', 'An error occurred while trying to import students.');
            } else {
                req.flash('success', 'The students have been imported successfully.');
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