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
    models.User.findUsersBySearchQuery(req.query.q, 'teachingAssistant').exec(function (err, users) {
        res.render('admin/tables/course-teaching-assistants-search-results', { 
            course: req.course, 
            teachingAssistants: users 
        });
    });
};
// Update list of teaching assistants for course
exports.editTeachingAssistantList = function (req, res) {
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
            res.json({ status: !err });
        });
    });
};
// Add teaching assistant to course
exports.addTeachingAssistant = function (req, res) {
    req.course.update({ $addToSet: { teachingAssistants: req.us3r.id }}, function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Teaching assistant <b>%s</b> has been added to the course.', req.us3r.name.full);
        res.json({ status: !err });
    });
};
// Delete teaching assistant from course and associated tutorials
exports.deleteTeachingAssistant = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        async.waterfall([
            function delRef1(done) {
                req.course.update({ $pull: { teachingAssistants: req.us3r.id }}, done);
            },
            function delRef2(course, done) {
                async.eachSeries(req.course.tutorials, function (tutorial, done) {
                    tutorial.update({ $pull: { teachingAssistants: req.us3r.id }}, done);
                }, done);
            }
        ], function (err) {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'Teaching assistant <b>%s</b> has been removed from the course.', req.us3r.name.full);
            res.json({ status: !err });
        });
    });  
};