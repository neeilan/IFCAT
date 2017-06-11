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
    async.series([
        done => {
            models.TutorialQuiz.count(query, done);
        },
        done => {
            models.TutorialQuiz
                .find(query)
                .populate('tutorial quiz')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec(done);
        }
    ], (err, data) => {
        let pages = _.range(1, _.ceil(data[0] / perPage) + 1);
        res.render('admin/pages/tutorial-quizzes', {
            bodyClass: 'tutorial-quizzes',
            title: 'Conduct Quizzes',
            course: req.course,
            tutorial: req.tutorial,
            tutorialQuizzes: data[1].sort((a, b) => {
                var m = a.quiz.name.toLowerCase(),
                    n = b.quiz.name.toLowerCase(),
                    s = a.tutorial.number.toLowerCase(),
                    t = b.tutorial.number.toLowerCase();
                return m.localeCompare(n) || s.localeCompare(t);
            }),
            pagination: {
                page: page,
                pages: _.filter(pages, p => p >= page - 2 && p <= page + 2),
                perPage: perPage
            }
        });
    });
};
// Edit quizzes 
exports.editTutorialQuizzes = (req, res) => {
    let redirectTo = `/admin/courses/${req.course._id}/conduct`;
    // find property to update
    let property = _.find(['published', 'active', 'archived'], p => req.body && _.has(req.body, p));
    // nothing to update
    if (!property)
        return res.redirect(redirectTo);
    // update property
    models.TutorialQuiz.update({ 
        _id: { $in: req.body.tutorialQuizzes || [] }
    }, { 
        $set: { [property]: req.body[property] }
    }, {
        multi: true
    }, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Quizzes have been updated.');
        return res.redirect(redirectTo);
    });
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
    models.TutorialQuiz.findOneAndUpdate({ 
        tutorial: req.tutorial, 
        quiz: req.quiz 
    }, { 
        $set: {
            allocateMembers: req.body.allocateMembers,
            max: {
                membersPerGroup: req.body.max.membersPerGroup
            },
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