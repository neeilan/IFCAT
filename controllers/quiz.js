var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve course
exports.getQuiz = function (req, res, next, quiz) {
    models.Quiz.findById(quiz).exec(function (err, quiz) {
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
    req.course.withQuizzes().execPopulate().then(function() {
        res.render('admin/course-quizzes', { course: req.course });
    });
};

// Retrieve quiz form
exports.getQuizForm = function (req, res) {
    if (!req.quiz) {
        req.quiz = new models.Quiz();
    }
    req.course.withTutorials().execPopulate().then(function () {
        req.quiz.loadTutorials().then(function () {
            res.render('admin/course-quiz', { course: req.course, quiz: req.quiz });
        });
    });
};

// Add quiz to course
exports.addQuiz = function (req, res) {
    var quiz = new models.Quiz();
    quiz.store(req.body, function (err, quiz) {
        req.course.quizzes.push(quiz);
        req.course.save(function (err) {
            res.redirect('/admin/courses/' + req.course.id + '/quizzes');
        });
    });
};

// Update quiz
exports.editQuiz = function (req, res) {
    req.quiz.store(req.body, function (err) { 
        /*if (err) {
            return res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } */
        res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/edit');
    });
};

// Delete quiz
exports.deleteQuiz = function (req, res) {};