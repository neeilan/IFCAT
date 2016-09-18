var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve course
exports.getTutorial = function (req, res, next, tutorial) {
    models.Tutorial.findById(tutorial, function (err, tutorial) {
        if (err) {
            return next(err);
        }
        if (!tutorial) {
            return next(new Error('No tutorial is found.'));
        }
        console.log('got tutorial');
        req.tutorial = tutorial;
        next();
    });
};
// Retrieve list of tutorials for course
exports.getTutorialList = function (req, res) {
    req.course.withTutorials(true).execPopulate().then(function (err) {
        res.render('admin/course-tutorials', { course: req.course });
    });
};
// Retrieve specific tutorial for tutorial
exports.getTutorialForm = function (req, res) { 
    res.render('admin/course-tutorial', { course: req.course, tutorial: req.tutorial || new models.Tutorial() });
};
// Add new tutorial for tutorial
exports.addTutorial = function (req, res) {
    models.Tutorial.create(req.body, function (err, tutorial) {
        req.course.tutorials.push(tutorial);
        req.course.save(function (err) {
            res.redirect('/admin/courses/' + req.course.id + '/tutorials');
        });
    });
};
// Update specific tutorial for course
exports.editTutorial = function (req, res) {
    _.extend(req.tutorial, req.body).save(function (err) {  
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorials/' + req.tutorial.id + 
            '/edit'
        );
    });
};
// Delete specific tutorial for course
exports.deleteTutorial = function (req, res) {
    req.tutorial.remove(function (err) {
        res.json({ status: true });
    });
};