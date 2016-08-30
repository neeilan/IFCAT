var async = require('async'),
    _ = require('lodash');

var Course = require('../models/course'),
    Quiz = require('../models/quiz'),
    Question = require('../models/question');

// Retrieve course
exports.getQuiz = function (req, res, next, quiz) {
    Quiz.findById(quiz).exec(function (err, quiz) {
        if (err) {
            return next(err);
        }
        if (!quiz) {
            return next(new Error('No quiz is found.'));
        }
        console.log('got quiz');
        req.quiz = quiz;
        next();
    });
};

// Retrieve quizzes within course
exports.getQuizList = function (req, res) {
    Course.populate(req.course, {
        path: 'quizzes', options: { sort: { name: 1 } }
    }, function (err) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }*/
        res.render('admin/course-quizzes', { course: req.course });
    });
};

// Retrieve quiz form
exports.getQuizForm = function (req, res) {
    Course.populate(req.course, {
        path: 'tutorials',
        sort: { number: 1 } 
    }, function () {
        var quiz = req.quiz || new Quiz();
   
        //quiz.setDefault(req.course);

//console.log(quiz.settings, quiz.settings.gradingScheme.length);

        res.render('admin/course-quiz', { course: req.course, quiz: quiz });
    });
};

// Add quiz to course
exports.addQuiz = function (req, res) {
    async.waterfall([
        function (next) {
            Quiz.create(req.body, next);
        },
        function (quiz, next) {
            req.course.quizzes.push(quiz);
            req.course.save(function (err) {
                next(err, quiz);
            });
        }
    ], function (err) {
        res.redirect('/admin/courses/' + req.course.id + '/quizzes');
    });
};

// Update quiz
exports.editQuiz = function (req, res) {
    _.extend(req.quiz, req.body).save(function (err) {  
        /*if (err) {
            return res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } */
        res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/edit');
    });
};

// Delete quiz
exports.deleteQuiz = function (req, res) {

};

// TO-BE-REMOVED

exports.getQuizzesDemo = function (req, res) {
    Course.findById(req.params.course).populate('quizzes').exec(function (err, course) { 
        res.render('student/quizzes', { course: course });
    });   
};

exports.startQuizDemo = function (req, res) {
    /*async.waterfall([
        function (next) {
            Course.findById(req.params.course, next);
        },
        function (course, next) {
            Quiz.findById(req.params.quiz, function (err, quiz) {
                next(err, course, quiz);
            });
        },
        function (course, quiz, next) {
            if (quiz.questions.length) {
                Question.findById(quiz.questions[0], function (err, question) {
                    next(err, course, quiz, question);
                });
            } else {
                res.redirect('/courses/' + req.params.course + '/quizzes');
            }
        }
    ],
    function (err, course, quiz, question, i) {
        res.render('student/start', { course: course, quiz: quiz, question: question });
    });*/
};

exports.endQuizDemo = function (req, res) {
    /*async.waterfall([
        function (next) {
            Course.findById(req.params.course, next);
        },
        function (course, next) {
            Quiz.findById(req.params.quiz, function (err, quiz) {
                next(err, course, quiz);
            });
        }
    ],
    function (err, course, quiz, question, i) {
        res.render('student/end', { course: course, quiz: quiz });
    });*/
};