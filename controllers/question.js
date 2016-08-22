var async = require('async'),
    _ = require('lodash');

// models
var Course = require('../models/course'),
    Quiz = require('../models/quiz'),
    Question = require('../models/question').Generic,
    MultipleChoiceQuestion = require('../models/question').MultipleChoice,
    TrueOrFalseQuestion = require('../models/question').TrueOrFalse;

// Retrieve list of questions for quiz
exports.getQuestions = function (req, res) { 
    async.series([
        function (cb) {
            Course.findById(req.params.course, cb);
        },
        function (cb) {
            Quiz.findById(req.params.quiz).populate({ path: 'questions', options: { sort: { name: 1 } } }).exec(cb);
        }
    ], 
    function (err, results) {
        res.render('admin/questions', { course: results[0], quiz: results[1] });
    }); 
};

// Retrieve specific question for quiz
exports.getNewQuestionForm = function (req, res) {
    async.series([
        function (cb) { 
            Course.findById(req.params.course).populate('files').exec(cb); 
        },
        function (cb) { 
            Quiz.findById(req.params.quiz, cb); 
        }
    ], 
    function (err, results) {
        res.render('admin/question', { course: results[0], quiz: results[1], question: new Question() });
    });
};

// Retrieve specific question for quiz
exports.getQuestionForm = function (req, res) {
    async.series([
        function (cb) { 
            Course.findById(req.params.course).populate('files').exec(cb); 
        },
        function (cb) { 
            Quiz.findById(req.params.quiz, cb); 
        },
        function (cb) { 
            Question.findById(req.params.question).populate('files').exec(cb); 
        }
    ], 
    function (err, results) {
        res.render('admin/question', { course: results[0], quiz: results[1], question: results[2] });
    });
};

// Add new question for quiz
exports.addQuestion = function (req, res, next) { 
    var question;
    async.waterfall([
        function (next) { 
            Quiz.findById(req.params.quiz, next); 
        },
        function (quiz, next) {
            if (req.body.type === 'MultipleChoice') {
                question = new MultipleChoiceQuestion();
                var items = { choices: {}, answers: {} };
                // sort choices + answers
                for (var key in req.body) {
                    var matches = /^(choices|answers)\[(\d+)\]$/g.exec(key);
                    if (matches) {
                        items[matches[1]][matches[2]] = req.body[key];  
                    }
                }
                // add choices + answers 
                for (var n in items.choices) {
                    question.choices.push(items.choices[n]);
                    // check if choice was selected as an answer
                    if (items.answers[n] !== undefined) {
                        question.answers.push(question.choices.length - 1);
                    }
                }
            } else {
                question = new TrueOrFalseQuestion();
                question.choices = req.body['choices[]'];
                question.answer = parseInt(req.body.answer, 10);
            }
            question.question = req.body.question;
            question.files = req.body['files[]'];
            question.randomizeChoices = req.body.randomizeChoices;
            question.useLaTeX = req.body.useLaTeX;
            question.save(function (err) {
                next(err, quiz, question);
            });
        },
        function (quiz, question, next) {
            quiz.questions.push(question);
            quiz.save(function (err) {
                next(err, quiz, question);
            });
        }
    ], 
    function (err, results) {
        if (err) {
            console.log(err);
        }
        res.redirect(
            '/admin/courses/' + req.params.course + 
            '/quizzes/' + req.params.quiz + 
            '/questions'
        );
    });
};

// Update specific question for quiz
exports.editQuestion = function (req, res, next) { 
    console.log('body', req.body);

    async.waterfall([
        function (next) {
            Quiz.findById(req.params.quiz, next);
        },
        function (quiz, next) {
            Question.findById(req.params.question, function (err, question) {
                next(err, quiz, question);
            });
        },
        function (quiz, question, next) { 
            if (question.type === 'MultipleChoice') {
                var items = { choices: {}, answers: {} };
                // sort choices + answers
                for (var key in req.body) {
                    var matches = /^(choices|answers)\[(\d+)\]$/g.exec(key);
                    if (matches) {
                        items[matches[1]][matches[2]] = req.body[key];  
                    }
                }
                // clear choices + answers
                question.choices = [];
                question.answers = [];
                // add choices + answers
                for (var n in items.choices) {
                    question.choices.push(items.choices[n]);
                    // check if choice was selected as an answer
                    if (items.answers[n] !== undefined) {
                        question.answers.push(question.choices.length - 1);
                    }
                }
            } else {
                question.choices = req.body['choices[]'];
                question.answer = parseInt(req.body.answer, 10);
            }
            question.question = req.body.question;
            question.files = req.body['files[]'];
            question.randomizeChoices = req.body.randomizeChoices;
            question.useLaTeX = req.body.useLaTeX;

            question.save(function (err) {
                next(err, quiz, question);
            });
        }
    ], 
    function (err, results) {
        if (err) {
            console.log(err);
        }
        res.redirect(
            '/admin/courses/' + req.params.course + 
            '/quizzes/' + req.params.quiz + 
            '/questions/' + req.params.question + 
            '/edit'
        );
    });
};

// Delete specific question for quiz
exports.deleteQuestion = function (req, res) { };