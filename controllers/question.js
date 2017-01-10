var _ = require('lodash'),
    async = require('async');
var config = require('../lib/config'),
    models = require('../models');

// Retrieve course
exports.getQuestion = function (req, res, next, question) {
    models.Question.findById(question, function (err, question) {
        if (err)
            return next(err);
        if (!question)
            return next(new Error('No question is found.'));
        req.question = question;         
        next();
    });
};
// Retrieve list of questions for quiz
exports.getQuestionList = function (req, res) { 
    req.quiz.withQuestions().execPopulate().then(function (err) {
        res.render('admin/quiz-questions', {
            title: 'Questions', 
            course: req.course, 
            quiz: req.quiz 
        });
    });
};
// Sort list of questions
exports.sortQuestionList = function (req, res) {
    var newOrder = req.body.questions || [];
    // sort questions based off order given
    req.quiz.questions.sort(function (a, b) {
        return newOrder.indexOf(a.toString()) < newOrder.indexOf(b.toString()) ? -1 : 1;
    });
    req.quiz.save(function (err) {
        if (err)
            return res.status(500).send('An error has occurred while trying to perform operation.');
        res.sendStatus(200);
    });
};
// Retrieve specific question for quiz
exports.getQuestionForm = function (req, res) {
    var question = req.question || new models.Question();
    req.course.withFiles().execPopulate().then(function () {
        res.render('admin/quiz-question', {
            title: question.isNew ? 'Add New Question' : 'Edit Question',
            course: req.course, 
            quiz: req.quiz, 
            question: question
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
        function addIntoQuiz(done) {
            req.quiz.update({ $addToSet: { questions: question.id }}, done);
        }
    ], function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been created.', question.number);

        if (req.body.back === '1')
            res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/questions');
        else
            res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/questions/new');
    });
};
// Update specific question for quiz
exports.editQuestion = function (req, res) {
    req.question.store(req.body, function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been updated.', req.question.number);

        res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/questions/' + req.question.id + '/edit');
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