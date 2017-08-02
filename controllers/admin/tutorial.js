var _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    models = require('../../models');
// Retrieve tutorial
exports.getTutorialByParam = (req, res, next, id) => {
    models.Tutorial.findById(id, (err, tutorial) => {
        if (err) return next(err);
        if (!tutorial) return next(new Error('No tutorial is found.'));
        req.tutorial = tutorial;
        next();
    });
};
// Retrieve list of tutorials for course
exports.getTutorials = (req, res, next) => {
    models.Tutorial.find({ 
        _id: { $in: req.course.tutorials }
    }).populate('teachingAssistants').exec((err, tutorials) => {
        if (err) return next(err);
        res.render('admin/pages/course-tutorials', {
            bodyClass: 'tutorials-page',
            title: 'Tutorials',
            course: req.course,
            tutorials: tutorials
        });
    });
};
// Add multiple tutorials for course
exports.addTutorials = (req, res, next) => {
    let len = Math.abs(_.toInteger(req.body.len)),
        start = Math.abs(_.toInteger(req.body.start)),
        range = _.range(start, len + start);
    models.Tutorial.find({ _id: { $in: req.course.tutorials }}, 'number', (err, tutorials) => {
        // get list of tutorial numbers
        let numbers = tutorials.map(tutorial => _.toInteger(tutorial.number));
        // add new tutorials
        async.eachSeries(range, (n, done) => {
            // check whether number has not already been processed
            if (numbers.indexOf(n) > -1)
                return done();
            // check whether tutorial has already been
            models.Tutorial.create({ number: n }, (err, tutorial) => {
                if (err) return done(err);
                req.course.update({ $addToSet: { tutorials: tutorial.id }}, done);
            });
        }, err => {
            if (err) return next(err);
            req.flash('success', 'List of tutorials has been updated.');
            res.redirect(`/admin/courses/${req.course.id}/tutorials`);
        });
    });
};
// Retrieve specific tutorial for tutorial
exports.getTutorial = (req, res, next) => {
    res.render('admin/pages/course-tutorial', {
        bodyClass: 'tutorial-page',
        title: 'Edit tutorial',
        course: req.course, 
        tutorial: req.tutorial 
    });
};
// Update specific tutorial for course
exports.editTutorial = (req, res, next) => {
    req.tutorial.set(req.body).save(err => {
        if (err) return next(err);
        req.flash('success', 'Tutorial <b>%s</b> has been updated.', req.tutorial.number);
        res.redirect('back');
    });
};
// Delete specific tutorial for course
exports.deleteTutorial = (req, res, next) => {
    req.tutorial.remove(err => {
        if (err) return next(err);
        req.flash('success', 'Tutorial <b>%s</b> has been deleted.', req.tutorial.number);
        res.sendStatus(200);
    });
};