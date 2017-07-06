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
    req.tutorial.withStudents().execPopulate().then(() => {
        models.TutorialQuiz.findOne({ tutorial: req.tutorial, quiz: req.quiz }).populate({
            path: 'groups',
            options: {
                sort: { name: 1 }
            }
        }).exec((err, tutorialQuiz) => {
            console.log(tutorialQuiz.groups)
            res.render('admin/pages/tutorial-quiz', {
                bodyClass: 'tutorial-quiz',
                title: `Conduct ${req.quiz.name} in tutorial ${req.tutorial.number}`,
                course: req.course, 
                tutorial: req.tutorial,
                quiz: req.quiz,
                tutorialQuiz: tutorialQuiz,
                students: req.tutorial.students,
                groups: tutorialQuiz.groups
            });
        });
    });
};
// Publish quiz for tutorial
exports.editTutorialQuiz = (req, res) => {
    models.TutorialQuiz.findOneAndUpdate({ 
        tutorial: req.tutorial, 
        quiz: req.quiz 
    }, { 
        $set: {
            allocateMembers: req.body.allocateMembers,
            maxMembersPerGroup: req.body.maxMembersPerGroup,
            published: req.body.published,
            active: req.body.active,
            archived: req.body.archived
        }
    }, {
        new: true
    }, (err, tutorialQuiz) => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else {
            req.app.locals.io.in('tutorialQuiz:' + tutorialQuiz.id).emit('quizActivated', tutorialQuiz);
            req.flash('success', '<b>%s</b> settings have been updated for <b>TUT %s</b>.', req.quiz.name, req.tutorial.number);
        }
        res.redirect(`/admin/courses/${req.course.id}/tutorials/${req.tutorial.id}/quizzes/${req.quiz.id}/conduct`);
    });
};