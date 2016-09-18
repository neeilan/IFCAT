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
exports.deleteCourse = function (req, res) {
    req.course.remove(function (err) {
        res.json({ status: true });
    });
};








// FOR TEST PURPOSES ONLY

exports.generateData = function (req, res) {
    var course, 
        tutorial, 
        quiz,
        tutorialQuiz;

    var quizSize = 10,
        tutorialSize = 10,
        groupSize = Math.floor(Math.random() * tutorialSize) + 1;

    async.series([
        // create course
        function (done) {
            var code = 
                _.sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4).join('') + 
                _.sampleSize('0123456789', 2).join('') + 'H' +
                _.sampleSize('123', 1).join('');
            var name = 'Generated Course';
            models.Course.create({ code: code, name: name }, function (err, doc) {
                course = doc;
                done(err);
            });
        },
        // create tutorial
        function (done) {
            models.Tutorial.create({ number: '0001' }, function (err, doc) {
                tutorial = doc;
                // add tutorial to course
                course.tutorials.push(tutorial);
                course.save(done);
            });
        },
        // create quiz
        function (done) {
            models.Quiz.create({ name: 'Generated Quiz 1' }, function (err, doc) {
                quiz = doc;
                // add tutorial to course
                course.quizzes.push(quiz);
                course.save(done);
            });
        },
        // create students
        function (done) {
            var arr = [];
            for (var i = 0; i < tutorialSize; i++) {
                var n = _.sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6).join(''),
                    m = _.sampleSize('01234', 1).join('');
                arr.push({
                    'UTORid': n + m,
                    'name.first': n,
                    'name.last': n,
                    'local.email': n + m + '@mail.utoronto.ca',
                    'local.password': '',
                    'roles': ['student']
                });
            }

            async.eachSeries(arr, function (item, done) {
                models.User.create(item, function (err, doc) {
                    // add to course
                    course.addStudent(doc);
                    course.save(function () {
                        // add to tutorial
                        tutorial.addStudent(doc);
                        tutorial.save(function () {
                            done(err);
                        });
                    });
                });
            }, done);
        },
        // create questions
        function (done) {
            var arr = [];
            for (var n = 1; n <= quizSize; n++) {
                arr.push({
                    'number': n,
                    'question': 'Generated Question ' + n,
                    'type': _.shuffle(['multiple choice', 'true or false', 'multiple select'])[0],
                    'choices': ['abc', 'def', 'ghi'],
                    'answers': _.shuffle(['abc', 'def', 'ghi'])[0],
                    'files': []
                });
            }
            async.eachSeries(arr, function (item, done) {
                models.Question.create(item, function (err, doc) {
                    // add to quiz
                    quiz.questions.push(doc);
                    quiz.save(done);
                });
            }, done);
        },
        // create tutorial-quiz
        function (done) {
            models.TutorialQuiz.create({ tutorial: tutorial.id, quiz: quiz.id }, function (err, doc) {
                tutorialQuiz = doc;
                done(err);
            })
        },
        // create groups
        function (done) {
            async.eachSeries(_.chunk(tutorial.students, groupSize), function (members, done) {
                models.Group.create({
                    name: _.sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 3).join(''),
                    members: members,
                    driver: members[0]
                }, function (err, doc) {
                    // add group to tutorial-quiz
                    tutorialQuiz.groups.push(doc);
                    tutorialQuiz.save(done);
                });
            }, done);
        },
        // create responses for groups in tutorialQuiz
        function (done) {
            async.eachSeries(tutorialQuiz.groups, function (group, done) {
                // create response for each question
                async.eachSeries(quiz.questions, function (question, done) {
                    var apc = _.shuffle([[0, 4, true], [1, 2, true], [2, 1, true], [3, 0, false]])[0];
                    models.Response.create({
                        group: group.id,
                        question: question.id,
                        attempts: apc[0],
                        points: apc[1],
                        correct: apc[2]
                    }, function (err, doc) {
                        tutorialQuiz.responses.push(doc);
                        tutorialQuiz.save(done);
                    });
                }, done);
            }, done);
        }
    ], function (done) {
        res.redirect('/admin/courses');
    });
};