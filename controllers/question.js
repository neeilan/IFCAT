var _ = require('lodash');

var models = require('../models');

// Retrieve course
exports.getQuestion = function (req, res, next, question) {
    models.models.Question.findById(question).populate('files').exec(function (err, question) {
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
    models.Quiz.populate(req.quiz, { 
        path: 'questions', options: { sort: { name: 1 } } 
    }, function (err, results) {
        res.render('admin/quiz-questions', { course: req.course, quiz: req.quiz });
    });
};

// Retrieve specific question for quiz
exports.getQuestionForm = function (req, res) {
    var question = req.question || new models.Question();
    // set quiz default values
    //question.setDefault(req.quiz);
    
    models.Course.populate(req.course, { path: 'files', sort: { name: 1 } }, function (err) {
        res.render('admin/quiz-question', { 
            course: req.course, 
            quiz: req.quiz, 
            question: question
        });
    });
};

// Add new question for quiz
exports.addQuestion = function (req, res, next) {
    var question = new Question();
    question.loadAndSave(req.body, function (err) {
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
    req.question.loadAndSave(req.body, function (err) {
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