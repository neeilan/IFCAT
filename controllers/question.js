var _ = require('lodash');

var models = require('../models');

// Retrieve course
exports.getQuestion = function (req, res, next, question) {
    models.models.Question.findById(question).withFiles().exec(function (err, question) {
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
    var question = new Question();
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
exports.deleteQuestion = function (req, res) { };