const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    models = require('../../models');
// Retrieve tutorial quiz
exports.getTutorialQuizByParam = (req, res, next, id) => {
    models.TutorialQuiz.findById(id, (err, tutorialQuiz) => {
        if (err) return next(err);
        if (!tutorialQuiz) return next(new Error('No tutorial quiz is found.'));
        req.tutorialQuiz = tutorialQuiz;
        next();
    });
};
// Retrieve quizzes within course OR by tutorial
exports.getTutorialQuizzes = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 10;

    let query = { quiz: { $in: req.course.quizzes }};
    if (req.tutorial)
        query = { tutorial: req.tutorial };

    models.TutorialQuiz.findAndCount(query, {
        page: page,
        perPage: perPage
    }, (err, tutorialQuizzes, count, pages) => {
        if (err) return next(err);
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
exports.editTutorialQuizzes = (req, res, next) => {
    let op = {
        publish: ['published', true],
        unpublish: ['published', false],
        activate: ['active', true],
        deactivate: ['active', false],
        archive: ['archived', true],
        unarchive: ['archived', false]
    }[req.body.op];

    async.mapSeries(req.body.tutorialQuizzes || [], (id, done) => {
        models.TutorialQuiz.findByIdAndUpdate(id, { [op[0]]: op[1] }, { new: true }, done);
    }, (err, tutorialQuizzes) => {
        if (err) return next(err);
        // notify students
        _.each(tutorialQuizzes, tutorialQuiz => {
            req.app.locals.io.in(`tutorialQuiz:${tutorialQuiz._id}`).emit('quizActivated', tutorialQuiz);
        });
        res.sendStatus(200);
    });
};
// Retrieve quiz for tutorial
exports.getTutorialQuiz = (req, res, next) => {
    req.tutorialQuiz.populate([{
        path: 'tutorial',
        populate: {
            path: 'students'
        }
    }, {
        path: 'quiz'
    }, {
        path: 'groups'
    }]).execPopulate().then(() => {
        res.render('admin/pages/tutorial-quiz', {
            bodyClass: 'tutorial-quiz',
            title: `Conduct ${req.tutorialQuiz.quiz.name} in Tutorial ${req.tutorialQuiz.tutorial.number}`,
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            tutorial: req.tutorialQuiz.tutorial,
            quiz: req.tutorialQuiz.quiz,
            students: req.tutorialQuiz.tutorial.students,
            groups: _.sortBy(req.tutorialQuiz.groups, group => _.toInteger(group.name))
        });
    });
};
// Edit settings for tutorial quiz
exports.editTutorialQuizSettings = (req, res, next) => {
    async.series([
        done => {
            req.tutorialQuiz.populate('tutorial quiz', done);
        },
        done => {
            req.tutorialQuiz.set({
                allocateMembers: req.body.allocateMembers,
                maxMembersPerGroup: req.body.maxMembersPerGroup,
                published: !!req.body.published,
                active: !!req.body.active,
                archived: !!req.body.archived
            }).save(done);
        }
    ], err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else {
            req.app.locals.io.in(`tutorialQuiz:${req.tutorialQuiz._id}`).emit('quizActivated', req.tutorialQuiz);
            req.flash('success', '<b>%s</b> settings have been updated for <b>TUT %s</b>.', req.tutorialQuiz.quiz.name, req.tutorialQuiz.tutorial.number);
        }
        res.redirect(`/admin/courses/${req.course._id}/tutorials-quizzes/${req.tutorialQuiz._id}`);
    });
};