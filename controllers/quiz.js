const _ = require('lodash'),
    async = require('async'),
    config = require('../lib/config'),
    mongoose = require('mongoose'),
    models = require('../models');

// Retrieve course
exports.getQuizByParam = function (req, res, next, quiz) {
    models.Quiz.findById(quiz, function (err, quiz) {
        if (err)
            return next(err);
        if (!quiz)
            return next(new Error('No quiz is found.'));
        req.quiz = quiz;
        next();
    });
};
// Retrieve quizzes within course
exports.getQuizzes = (req, res) => {
    req.course.withQuizzes().execPopulate().then(function() {
        res.render('admin/course-quizzes', { 
            title: 'Quizzes',
            course: req.course 
        });
    });
};
// Retrieve quiz form
exports.getQuiz = (req, res) => {
    var quiz = req.quiz || new models.Quiz();
    req.course.withTutorials().execPopulate().then(function () {
        models.TutorialQuiz.find({ quiz: quiz.id }).exec(function (err, tutorialQuizzes) {
            quiz.tutorials = _.map(tutorialQuizzes, function (tutorialQuiz) {
                return tutorialQuiz.tutorial.toString();
            });
            res.render('admin/course-quiz', {
                title: quiz.isNew ? 'Add New Quiz' : 'Edit Quiz',
                course: req.course, 
                quiz: quiz
            });
        });
    });
};
// Add quiz to course
exports.addQuiz = (req, res) => {
    var quiz = new models.Quiz();
    async.series([
        function add(done) {
            quiz.store(req.body, done);
        },
        function addIntoCourse(done) {
            req.course.update({ $push: { quizzes: quiz.id }}, done);
        }
    ], function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been created.', quiz.name);
        res.redirect('/admin/courses/' + req.course.id + '/quizzes');
    });
};
// Update quiz
exports.editQuiz = (req, res) => {
    req.quiz.store(req.body, function (err) { 
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been updated.', req.quiz.name);
        res.redirect('/admin/courses/' + req.course.id + '/quizzes/' + req.quiz.id + '/edit');
    });
};
// Copy quiz
exports.copyQuiz = (req, res) => {
    async.waterfall([
        function cloneQuestions(done) {
            req.quiz.withQuestions().execPopulate().then(function () {
                async.mapSeries(req.quiz.questions, function (question, done) {
                    question._id = mongoose.Types.ObjectId();
                    question.isNew = true;
                    question.save(function (err) {
                        if (err) 
                            return done(err);
                        done(null, question._id);
                    });
                }, done);
            });
        },
        function cloneQuiz(questions, done) {
            req.quiz._id = mongoose.Types.ObjectId();
            req.quiz.isNew = true;
            req.quiz.name += ' (copy)';
            req.quiz.questions = questions;
            req.quiz.save(done);
        },
        function addQuiz(quiz, numAffected, done) {
            req.course.update({ $addToSet: { quizzes: quiz }}, done)
        }
    ], function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been added.', req.quiz.name);
        res.sendStatus(200);
    });
};
// Delete quiz
exports.deleteQuiz = (req, res) => {
    req.quiz.remove(function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been deleted.', req.quiz.name);
        res.sendStatus(200);
    });
};