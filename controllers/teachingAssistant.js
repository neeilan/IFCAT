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
    // save
    req.course.withTutorials().execPopulate().then(function (err) {
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            var newAssistants = [];
            if (tutorials.hasOwnProperty(tutorial.id)) {
                newAssistants = tutorials[tutorial.id]; 
            }
            // check if changes were made
            if (_.difference(tutorial.teachingAssistants, newAssistants)) {
                tutorial.teachingAssistants = newAssistants;
                tutorial.save(done);
            } else {
                done();
            }
        }, function (err) {
            res.json({ status: true });
        });
    });
};
// Add teaching assistant to course
exports.addTeachingAssistant = function (req, res) {
    req.course.addTeachingAssistant(req.us3r.id);
    req.course.save(function (err) {
        res.json({ status: true });
    });
};
// Update teaching assistant in tutorials
exports.editTeachingAssistant = function (req, res) {
     req.course.withTutorials().execPopulate().then(function () {
        // update teaching assistant in tutorial
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            if (!req.body.tutorials || req.body.tutorials.indexOf(tutorial.id) === -1) {
                tutorial.deleteTeachingAssistant(req.us3r.id);
            } else {
                tutorial.addTeachingAssistant(req.us3r.id);
            }
            tutorial.save(done);
        }, function (err) {
            res.json({ status: true });
        });
    });
};
// Delete teaching assistant from course and associated tutorials
exports.deleteTeachingAssistant = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        // remove teaching assistant from tutorials
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            tutorial.deleteTeachingAssistant(req.us3r.id);
            tutorial.save(done);
        // remove teaching assistant from course
        }, function (err) {
            req.course.deleteTeachingAssistant(req.us3r.id);
            req.course.save(function (err) {
                res.json({ status: true });
            });
        });
    });  
};