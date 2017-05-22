const _ = require('lodash'),
    async = require('async'),
    config = require('../lib/config'),
    models = require('../models'),
    mongoose = require('mongoose'),
    util = require('util');
// Retrieve list of teaching assistants for course
exports.getTeachingAssistantsByCourse = (req, res) => {
    req.course.withTutorials().withTeachingAssistants().execPopulate().then(err => {
        res.render('admin/course-teaching-assistants', {
            bodyClass: 'teaching-assistants',
            title: 'Teaching Assistants',
            course: req.course
        });
    });
};
// Retrieve list of teaching assistants matching search query
exports.getTeachingAssistantsBySearchQuery = (req, res) => {
    models.User.findBySearchQuery({ q: req.query.q, role: 'teachingAssistant' }, (err, teachingAssistants) => {
        res.render('admin/tables/course-teaching-assistants-search-results', { 
            course: req.course, 
            teachingAssistants: teachingAssistants
        });
    });
};
// Add teaching assistant to course
exports.addTeachingAssistants = (req, res) => {
    req.course.update({ $addToSet: { teachingAssistants: { $each: req.body.teachingAssistants || [] }}}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 's of teaching assistants has been updated.');
        res.redirect(`/admin/courses/${req.course.id}/teaching-assistants`);
    });
};
// Update list of teaching assistants for course
exports.editTeachingAssistants = (req, res) => {
    var stack = _.mapValues(req.body.tutorials, function (users) { 
        return _.keys(users).sort();
    });
    req.course.withTutorials().execPopulate().then(function () {
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            tutorial.update({ $set: { teachingAssistants: stack[tutorial.id] || [] }}, done);
        }, function (err) {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'The list of tutorials has been updated.');
            res.redirect('/admin/courses/' + req.course.id + '/teaching-assistants');
        });
    });
};
// Delete list of teaching assistants from course and associated tutorials
exports.deleteTeachingAssistants = (req, res) => {
    var teachingAssistants = req.body.teachingAssistants || [];
    req.course.withTutorials().execPopulate().then(function () {
        async.series([
            function deleteFromCourse(done) {
                req.course.update({ $pull: { teachingAssistants: { $in: teachingAssistants }}}, done);
            },
            function deleteFromTutorials(done) {
                async.eachSeries(req.course.tutorials, function (tutorial, done) {
                    tutorial.update({ $pull: { teachingAssistants: { $in: teachingAssistants }}}, done);;
                }, done);
            }
        ], function (err) {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'List of teaching assistants has been updated.');
            res.sendStatus(200);
        });
    });  
};