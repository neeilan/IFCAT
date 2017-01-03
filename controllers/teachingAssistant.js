var util = require('util');

var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve list of teaching assistants for course
exports.getTeachingAssistantListByCourse = function (req, res) {
    req.course.withTutorials().withTeachingAssistants().execPopulate().then(function (err) {
        res.render('admin/course-teaching-assistants', {
            title: 'Teaching assistants',
            course: req.course
        });
    });
};
// Retrieve list of teaching assistants matching search query
exports.getTeachingAssistantListBySearchQuery = function (req, res) {
    models.User.findBySearchQuery(req.query.q, 'teachingAssistant').exec(function (err, teachingAssistants) {
        res.render('admin/tables/course-teaching-assistants-search-results', { 
            course: req.course, 
            teachingAssistants: teachingAssistants
        });
    });
};
// Add teaching assistant to course
exports.addTeachingAssistantList = function (req, res) {
    async.each(req.body.teachingAssistants || [], function (teachingAssistant, done) {
        req.course.update({ $addToSet: { teachingAssistants: teachingAssistant }}, done);
    }, function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The teaching assistants has been assigned to the course.');
        res.redirect('/admin/courses/' + req.course.id + '/teaching-assistants');
    });
};
// Update list of teaching assistants for course
exports.editTeachingAssistantList = function (req, res) { console.log('updatin')
    var tutorials = req.body.tutorials || {};
    req.course.withTutorials().execPopulate().then(function () {
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            var newAssistants = [];
            if (tutorials.hasOwnProperty(tutorial.id))
                newAssistants = tutorials[tutorial.id]; 
            // check if changes were made
            if (_.difference(tutorial.teachingAssistants, newAssistants))
                tutorial.update({ $set: { teachingAssistants: newAssistants }}, done);
            else
                done();
        }, function (err) {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'The tutorials have been updated.');
            res.redirect('/admin/courses/' + req.course.id + '/teaching-assistants');
        });
    });
};
// Delete teaching assistant from course and associated tutorials
exports.deleteTeachingAssistant = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        async.waterfall([
            function deleteFromCourse(done) {
                req.course.update({ $pull: { teachingAssistants: req.us3r.id }}, done);
            },
            function deleteFromTutorials(course, done) {
                async.eachSeries(req.course.tutorials, function (tutorial, done) {
                    tutorial.update({ $pull: { teachingAssistants: req.us3r.id }}, done);
                }, done);
            }
        ], function (err) {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'Teaching assistant <b>%s</b> has been removed from the course.', req.us3r.name.full);
            res.sendStatus(200);
        });
    });  
};