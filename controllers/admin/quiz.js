const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    mongoose = require('mongoose'),
    models = require('../../models');
// Retrieve course
exports.getQuizByParam = (req, res, next, id) => {
    models.Quiz.findById(id, (err, quiz) => {
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
    req.course.withQuizzes().execPopulate().then(() => {
        res.render('admin/pages/course-quizzes', {
            bodyClass: 'quizzes',
            title: 'Quizzes',
            course: req.course 
        });
    });
};
// Retrieve quiz form
exports.getQuiz = (req, res) => {
    let quiz = req.quiz || new models.Quiz();
    req.course.withTutorials().execPopulate().then(() => {
        quiz.populate('tutorialQuizzes').execPopulate().then(() => {
            res.render('admin/pages/course-quiz', {
                bodyClass: 'quiz',
                title: quiz.isNew ? 'Add New Quiz' : 'Edit Quiz',
                course: req.course,
                quiz: quiz
            });
        });
    });
};
// Add quiz to course
exports.addQuiz = (req, res) => {
    let quiz = new models.Quiz();
    async.series([
        done => quiz.store(req.body).save(done),
        done => req.course.update({ $push: { quizzes: quiz._id }}, done),
        done => quiz.linkTutorials(req.body.tutorials, done)
    ], err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been created.', quiz.name);
        res.redirect(`/admin/courses/${req.course._id}/quizzes`);
    });
};
// Update quiz
exports.editQuiz = (req, res) => {
    async.series([
        done => req.quiz.store(req.body).save(done),
        done => req.quiz.linkTutorials(req.body.tutorials, done)
    ], err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been updated.', req.quiz.name);
        res.redirect(`/admin/courses/${req.course._id}/quizzes/${req.quiz._id}/edit`);
    });
};
// Copy quiz
exports.copyQuiz = (req, res) => {
    async.waterfall([
        done => {
            req.quiz.withQuestions().execPopulate().then(() => {
                async.mapSeries(req.quiz.questions, (question, done) => {
                    question._id = mongoose.Types.ObjectId();
                    question.isNew = true;
                    question.save(err => {
                        if (err) 
                            return done(err);
                        done(null, question._id);
                    });
                }, done);
            });
        },
        (questions, done) => {
            req.quiz._id = mongoose.Types.ObjectId();
            req.quiz.isNew = true;
            req.quiz.name += ' (copy)';
            req.quiz.questions = questions;
            req.quiz.save(done);
        },
        (quiz, numAffected, done) => {
            req.course.update({ $addToSet: { quizzes: quiz }}, done)
        }
    ], err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been added.', req.quiz.name);
        res.sendStatus(200);
    });
};
// Delete quiz
exports.deleteQuiz = (req, res) => {
    req.quiz.remove(err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', '<b>%s</b> has been deleted.', req.quiz.name);
        res.sendStatus(200);
    });
};