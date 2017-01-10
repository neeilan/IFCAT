var _ = require('lodash'),
    async = require('async');
var models = require('../models');

// Retrieve course
exports.getCourse = function (req, res, next, course) {
    models.Course.findById(course, function (err, course) {
        if (err)
            return next(err);
        if (!course)
            return next(new Error('No course is found.'));
        req.course = course;
        next();
    });
};
// Retrieve many courses
exports.getCourseList = function (req, res) {
    models.Course.find().sort('code').exec(function (err, courses) {
        res.render('admin/courses', { 
            title: 'Courses',
            courses: _.filter(courses, function (course) {
                return req.user.hasRole('admin') || 
                    course.instructors.indexOf(req.user.id) !== -1 || 
                    course.teachingAssistants.indexOf(req.user.id) !== -1; 
            }) 
        });
    });
};
// Get form for course
exports.getCourseForm = function (req, res) {
    var course = req.course || new models.Course();
    res.render('admin/course', { 
        title: course.isNew ? 'Add New Course' : 'Edit Course',
        course: course 
    });
};
// Add course
exports.addCourse = function (req, res) {
    models.Course.create(req.body, function (err, course) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been created.', course.name);
        res.redirect('/admin/courses');
    });
};
// Update course
exports.editCourse = function (req, res) {
    req.course.set(req.body).save(function (err) {  
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been updated.', req.course.name);
        res.redirect('/admin/courses/' + req.course.id + '/edit');
    });
};
// Delete course
exports.deleteCourse = function (req, res) {
    req.course.remove(function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been deleted.', req.course.name);   
        res.sendStatus(200);
    });
};




// FOR TEST PURPOSES ONLY

/*exports.generateData = function (req, res) {
    var course, 
        tutorial, 
        quiz,
        tutorialQuiz;
    var quizSize = 10,
        tutorialSize = 10,
        groupSize = Math.floor(Math.random() * tutorialSize - 2) + 1;
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
                    'UTORid': _.lowerCase(n + m),
                    'name.first': _.startCase(n),
                    'name.last': _.startCase(n),
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
            });
        },
        // create groups
        function (done) {
            async.eachOfSeries(_.chunk(tutorial.students, groupSize), function (members, i, done) {
                models.Group.create({
                    name: i + 1,
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
                        group: group,
                        question: question,
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
};*/