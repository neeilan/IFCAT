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
    var a = req.quiz.questions.slice().map(String), b = [];
    if (_.isArray(req.body.questions)) {
        b = req.body.questions.slice();
    }
    async.series([
        // to make sure questions don't get lost
        // known bug: fails if non-deleted references exist
        function isEqual(done) {
            done(_.isEqual(a, b) ? null : new Error('not equal'));
        },
        function updateSortOrder(done) {
            req.quiz.update({ $set: { questions: b }}, done);
        },
    ], function (err) {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform operation.');
        } else {
            req.flash('success', 'The questions have been sorted successfully.');
        }
        res.json({ status: !!err });       
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
        function addQuestion(done) {
            question.store(req.body, done);
        },
        function addReference(done) {
            req.quiz.update({ $addToSet: { questions: question.id }}, done);
        }
    ], function (err) {
        if (err) {
            req.flash('error', 'An error has occurred while trying to perform operation.');
        } else {
            req.flash('success', 'The question <b>%s</b> has been created successfully.', question.number);
        }
        res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/questions');
    });
};
// Update specific question for quiz
exports.editQuestion = function (req, res) {
    req.question.store(req.body, function (err) {
        if (err) {
            req.flash('error', 'An error has occurred while trying to perform operation.');
        } else {
            req.flash('success', 'The question <b>%s</b> has been updated successfully.', req.question.number);
        }
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
        if (err) {
            req.flash('error', 'An error has occurred while trying to perform operation.');
        } else {
            req.flash('success', 'The question <b>%s</b> has been deleted successfully.', req.question.number);
        }
        res.json({ status: !!err });
    });
};