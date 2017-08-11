const _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    models = require('../../models');
// Retrieve course
exports.getQuizByParam = (req, res, next, id) => {
    models.Quiz.findById(id, (err, quiz) => {
        if (err) return next(err);
        if (!quiz) return next(new Error('No quiz is found.'));
        req.quiz = quiz;
        next();
    });
};
// Retrieve quizzes within course
exports.getQuizzes = (req, res, next) => {
    req.course.withQuizzes().execPopulate().then(() => {
        res.render('admin/pages/course-quizzes', {
            bodyClass: 'quizzes-page',
            title: 'Quizzes',
            course: req.course 
        });
    }, next);
};
// Retrieve quiz form
exports.getQuiz = (req, res, next) => {
    let quiz = req.quiz || new models.Quiz();
    req.course.withTutorials().execPopulate().then(() => {
        quiz.populate('tutorialQuizzes').execPopulate().then(() => {
            res.render('admin/pages/course-quiz', {
                bodyClass: 'quiz-page',
                title: quiz.isNew ? 'Add New Quiz' : 'Edit Quiz',
                course: req.course,
                quiz: quiz
            });
        }, next);
    }, next);
};
// Add quiz to course
exports.addQuiz = (req, res, next) => {
    let quiz = new models.Quiz();
    async.series([
        done => quiz.store(req.body).save(done),
        done => req.course.update({ $push: { quizzes: quiz._id }}, done),
        done => quiz.linkTutorials(req.body.tutorials, done)
    ], err => {
        if (err) return next(err);
        req.flash('success', '<b>%s</b> has been created.', quiz.name);
        res.redirect(`/admin/courses/${req.course._id}/quizzes`);
    });
};
// Update quiz
exports.editQuiz = (req, res, next) => {
    async.series([
        done => req.quiz.store(req.body).save(done),
        done => req.quiz.linkTutorials(req.body.tutorials, done)
    ], err => {
        if (err) return next(err);
        req.flash('success', '<b>%s</b> has been updated.', req.quiz.name);
        res.redirect(`/admin/courses/${req.course._id}/quizzes/${req.quiz._id}/edit`);
    });
};
// Copy quiz
exports.copyQuiz = (req, res, next) => {
    async.waterfall([
        function (done) {
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
            }, done);
        },
        function (questions, done) {
            req.quiz._id = mongoose.Types.ObjectId();
            req.quiz.isNew = true;
            req.quiz.name += ' (copy)';
            req.quiz.questions = questions;
            req.quiz.save(done);
        },
        function (quiz, numAffected, done) {
            req.course.update({ $addToSet: { quizzes: quiz }}, done)
        }
    ], err => {
        if (err) return next(err);
        req.flash('success', '<b>%s</b> has been added.', req.quiz.name);
        res.sendStatus(200);
    });
};
// Delete quiz
exports.deleteQuiz = (req, res, next) => {
    req.quiz.remove(err => {
        if (err) return next(err);
        req.flash('success', '<b>%s</b> has been deleted.', req.quiz.name);
        res.sendStatus(200);
    });
};