var async = require('async'),
    mongoose = require('mongoose'),
    _ = require('lodash');

var Tutorial = require('../models/tutorial'),
    TutorialQuiz = require('../models/tutorial'),
    Group = require('../models/group');

// Retrieve group
exports.getGroup = function (req, res, next, group) { 
    Group.findById(group).exec(function (err, group) {
        if (err) {
            return next(err);
        }
        if (!group) {
            return next(new Error('No group is found.'));
        }
        console.log('got group');
        req.group = group;
        next();
    });
};

// Retrieve list of groups for tutorial
exports.getGroupList = function (req, res) { 
    TutorialQuiz.populate(req.tutorialQuiz, { 
        path: 'groups',
        model: Group, // !important
        populate: [{
            path: 'members',
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }, {
            path: 'representative'
        }]
    }, function (err) {
        res.render('admin/quiz-groups', { 
            course: req.course, 
            tutorial: req.tutorial, 
            tutorialQuiz: req.tutorialQuiz 
        });
    });
};

// Create new group for tutorial
exports.generateGroups = function (req, res) { 
    // randomize + split students into groups
    var chunks = _.chunk(_.shuffle(req.tutorial.students), 3);
    // delete original groups
    Group.remove({ _id: { $in: req.tutorialQuiz.groups } }, function (err) {
        req.tutorialQuiz.groups = [];
        // create new groups
        async.eachOfSeries(chunks, function (members, n, done) {
            Group.create({ 
                number: n + 1, 
                members: members,
                representative: members[0]
            }, function (err, group) {
                if (err) {
                    return done(err);
                }
                req.tutorialQuiz.groups.push(group);
                done();
            });
        }, function (err) {
            // add groups to tutorial
            req.tutorialQuiz.save(function (err) {
                if (err) {
                    return done(err);
                }
                res.redirect(
                    '/admin/courses/' + req.course.id + 
                    '/tutorials/' + req.tutorial.id + 
                    '/quizzes/' + req.tutorialQuiz.id +
                    '/groups'
                ); 
            });
        });
    });
};

// Delete group
exports.deleteGroup = function (req, res) { };