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
    models.Course.populate(req.course, {
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
    models.Course.populate(req.course, {
        path: 'tutorials',
        options: {
            sort: { number: 1 }
        }
    }, function (err) {
        res.render('admin/course-quiz', { course: req.course, quiz: req.quiz || new models.Quiz() });
    });
};

// Add quiz to course
exports.addQuiz = function (req, res) {
    async.waterfall([
        function (next) {
            models.Quiz.create(req.body, next);
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