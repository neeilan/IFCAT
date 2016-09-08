var _ = require('lodash'),
    async = require('async');
    
var models = require('../models');

// Retrieve group
exports.getGroup = function (req, res, next, group) { 
    models.Group.findById(group).exec(function (err, group) {
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
    req.tutorialQuiz.withGroups().execPopulate().then(function (err) {
        res.render('admin/quiz-groups', { 
            course: req.course, 
            tutorialQuiz: req.tutorialQuiz 
        });
    });
};

// Create new group for tutorial
exports.generateGroups = function (req, res) { 
    // delete original groups
    models.Group.remove({ _id: { $in: req.tutorialQuiz.groups } }, function (err) {
        // clear groups from tutorial + quiz
        req.tutorialQuiz.groups = [];
        // randomize + split students into groups
        var chunks = _.chunk(_.shuffle(req.tutorialQuiz.tutorial.students), 3);
        // create new groups in tutorial + quiz
        async.eachOfSeries(chunks, function (members, n, done) {
            models.Group.create({ 
                name: n + 1, 
                members: members
            }, function (err, group) {
                req.tutorialQuiz.groups.push(group);
                done();
            });
        }, function (err) {
            // add groups to tutorial
            req.tutorialQuiz.save(function (err) {
                res.redirect(
                    '/admin/courses/' + req.course.id + 
                    '/tutorial-quizzes/' + req.tutorialQuiz.id +
                    '/groups'
                ); 
            });
        });
    });
};

// Delete group
exports.deleteGroup = function (req, res) { };