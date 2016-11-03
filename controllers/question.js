var _ = require('lodash'),
    async = require('async'),
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
    var newOrder = req.body.questions || [];
    // sort questions based off order given
    req.quiz.questions.sort(function (a, b) {
        return newOrder.indexOf(a) < newOrder.indexOf(b) ? -1 : 1;
    });
    req.quiz.save(function (err) {
        if (err)
            return res.status(500).send('An error has occurred while trying to perform operation.');
        res.send('List of questions have been updated.');
    });
};
// Retrieve specific question for quiz
exports.getQuestionForm = function (req, res) {
    if (!req.question) {
        req.question = new models.Question();
    }
    req.course.withFiles().execPopulate().then(function () {
        res.render('admin/quiz-question', {
            title: req.question.isNew ? 'Add new question' : 'Edit question',
            course: req.course, 
            quiz: req.quiz, 
            question: req.question
        });
    });
};
// Add new question for quiz
exports.addQuestion = function (req, res) {
    var question = new models.Question();
    async.series([
        function add(done) {
            question.store(req.body, done);
        },
        function addRef(done) {
            req.quiz.update({ $addToSet: { questions: question.id }}, done);
        }
    ], function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been created.', question.number);
        res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/questions');
    });
};
// Update specific question for quiz
exports.editQuestion = function (req, res) {
    req.question.store(req.body, function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been updated.', req.question.number);
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
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been deleted.', req.question.number);
        res.sendStatus(200);
    });
};