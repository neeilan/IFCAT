var _ = require('lodash'),
    mongoose = require('mongoose');

var models = require('../models');

// Retrieve course
exports.getQuestion = function (req, res, next, question) {
    models.Question.findById(question, function (err, question) {
        if (err) {
            return next(err);
        }
        if (!question) {
            return next(new Error('No question is found.'));
        }
        console.log('got question'); 
        req.question = question;         
        next();
    });
};
// Retrieve list of questions for quiz
exports.getQuestionList = function (req, res) { 
    req.quiz.withQuestions().execPopulate().then(function (err) {
        res.render('admin/quiz-questions', { course: req.course, quiz: req.quiz });
    });
};
// Sort list of questions
exports.sortQuestionList = function (req, res) {
    var a = _.filter(req.quiz.questions, Boolean).slice().sort().toString(),
        b = [];
    if (_.isArray(req.body.questions)) {
        b = _.filter(req.body.questions, Boolean).slice().sort().toString();
    }
    // ensure that same, IDs are given
    if (_.isEqual(a, b)) {
        // set new order of questions
        req.quiz.questions = req.body.questions.map(function (str) { 
            return new mongoose.Types.ObjectId(str); 
        });
    }
    req.quiz.save(function (err) {
        res.json({ status: true });       
    });
};
// Retrieve specific question for quiz
exports.getQuestionForm = function (req, res) {
    if (!req.question) {
        req.question = new models.Question();
    }
    req.course.withFiles().execPopulate().then(function (err) {
        res.render('admin/quiz-question', { 
            course: req.course, 
            quiz: req.quiz, 
            question: req.question
        });
    });
};
// Add new question for quiz
exports.addQuestion = function (req, res, next) {
    var question = new models.Question();
    question.store(req.body, function (err) {
        req.quiz.questions.push(question);
        req.quiz.save(function (err) {
            res.redirect(
                '/admin/courses/' + req.course.id + 
                '/quizzes/' + req.quiz.id + 
                '/questions'
            );
        });
    });
};
// Update specific question for quiz
exports.editQuestion = function (req, res, next) {
    req.question.store(req.body, function (err) {
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/quizzes/' + req.quiz.id + 
            '/questions/' + req.question.id + 
            '/edit'
        );
    });      
};
// Delete specific question for quiz
exports.deleteQuestion = function (req, res) {
    req.question.remove(function (err) {
        req.quiz.questions.pull(req.question.id);
        req.quiz.save(function () {
            res.json({ status: true });
        });
    });
};