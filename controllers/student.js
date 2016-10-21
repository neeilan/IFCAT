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
exports.importStudentList = function (req, res) {
    // read spreadsheet
    csv.parse(req.file.buffer.toString(), {
        columns: true,
        delimiter: ',',
        skip_empty_lines: true
    }, function (err, rows) {
        async.eachSeries(rows, function (row, done) {
            // normalize properties
            _.each(_.keys(row), function (key) {
                if (/^utorid/i.test(key)) {
                    row.UTORid = row[key];
                } else if (/^first/i.test(key)) {
                    row.first = row[key];
                } else if (/^last/i.test(key)) {
                    row.last = row[key];
                } else if (/^e\-?mail/i.test(key)) {
                    row.email = row[key];
                } else if (/^password/i.test(key)) {
                    row.password = row[key];
                } else if (/^tutorial/i.test(key)) {
                    row.tutorial = row[key];
                }
            });
            async.waterfall([
                // add student if they do not already exist
                function (done) {     
                    // check if user exist already with UTORid
                    models.User.findUserByUTOR(row.UTORid).then(function (us3r) {
                        // if user does not already exist, create them
                        if (!us3r) {
                            us3r = new models.User();
                            us3r.UTORid = row.UTORid;
                        }
                        // update fields
                        if (row.first) {
                            us3r.name.first = row.first;
                        }
                        if (row.last) {
                            us3r.name.last = row.last;
                        }
                        if (row.email) {
                            us3r.local.email = row.email;
                        }
                        if (row.password) {
                            us3r.local.password = us3r.generateHash(row.password);
                        }
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
                        if (_.toInteger(tutorial.number) === _.toInteger(row.tutorial)) {
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
                req.flash('failure', 'An error occurred while trying to import students. ' + err);
            } else {
                req.flash('success', 'The students have been imported successfully.');
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
    req.course.withTutorials().execPopulate().then(function (err) {
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            var newStudents = [];
            if (tutorials.hasOwnProperty(tutorial.id)) {
                newStudents = tutorials[tutorial.id]; 
            }
            // check if changes were made
            if (_.difference(tutorial.students, newStudents)) {
                tutorial.students = newStudents;
                tutorial.save(done);
            } else {
                done();
            }
        }, function (err) {
            res.json({ status: true });
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
                    // teaching points
                    var result = {
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
                    
                    result.teachingPoints = (result.group.teachingPoints.reduce(function(sum, recipient){
                        if (recipient === req.us3r.id)
                            sum ++;
                        return sum;
                    }, 0))/2
                    
                    return result;
                });
                // tally the points
                var totalPoints = _.reduce(marks, function (sum, mark) {
                    return sum + mark.points;
                }, 0);
                 var totalTeachingPoints = _.reduce(marks, function (sum, mark) {
                    return sum + mark.teachingPoints;
                }, 0);

                res.render('admin/student-marks', {
                    student: req.us3r,
                    course: req.course,
                    tutorial: tutorial,
                    marks: marks,
                    totalPoints: totalPoints,
                    totalTeachingPoints : totalTeachingPoints
                });
            });
        }
    });
};