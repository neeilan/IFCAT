const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    models = require('../../models');
// Retrieve quizzes within course OR by tutorial
exports.getTutorialQuizzes = (req, res) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 10;

    let query = { quiz: { $in: req.course.quizzes }};
    if (req.tutorial)
        query = { tutorial: req.tutorial };

    models.TutorialQuiz.findAndCount(query, {
        page: page,
        perPage: perPage
    }, (err, tutorialQuizzes, count, pages) => {
        res.render('admin/pages/tutorial-quizzes', {
            bodyClass: 'tutorial-quizzes',
            title: 'Conduct Quizzes',
            course: req.course,
            tutorial: req.tutorial,
            tutorialQuizzes: tutorialQuizzes,
            pagination: {
                page: page,
                pages: pages,
                perPage: perPage
            }
        });
    });
};
// Edit quizzes 
exports.editTutorialQuizzes = (req, res) => {
    if (req.query.action && req.query.action.name && req.query.action.value) {
        // update property
        return models.TutorialQuiz.update({ 
            _id: { $in: req.body.tutorialQuizzes || [] }
        }, { 
            $set: { [req.query.action.name]: req.query.action.value }
        }, {
            multi: true
        }, err => {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'Quizzes have been updated.');
            res.sendStatus(200);
        });
    }
    res.sendStatus(200);
};
// Retrieve quiz for tutorial
exports.getTutorialQuiz = (req, res) => {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial, quiz: req.quiz }).populate([{
        path: 'tutorial',
        populate: {
            path: 'students',
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }, {
        path: 'groups'
    }]).exec((err, tutorialQuiz) => {
        res.render('admin/pages/tutorial-quiz', {
            bodyClass: 'tutorial-quiz',
            title: `Conduct ${req.quiz.name} in tutorial ${req.tutorial.number}`,
            course: req.course, 
            tutorial: req.tutorial,
            quiz: req.quiz,
            tutorialQuiz: tutorialQuiz,
            students: tutorialQuiz.tutorial.students,
            groups: tutorialQuiz.groups
        });
    });
};
// Publish quiz for tutorial
exports.editTutorialQuiz = (req, res) => {
    models.TutorialQuiz.findOneAndUpdate({ tutorial: req.tutorial, quiz: req.quiz }, { $set: req.body }, { new: true }, (err, tutorialQuiz) => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else {
            req.app.locals.io.in('tutorialQuiz:' + tutorialQuiz.id).emit('quizActivated', tutorialQuiz);
            req.flash('success', '<b>%s</b> settings have been updated for <b>TUT %s</b>.', req.quiz.name, req.tutorial.number);
        }
        res.redirect(`/admin/courses/${req.course.id}/tutorials/${req.tutorial.id}/quizzes/${req.quiz.id}/conduct`);
    });
};