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
    models.TutorialQuiz.populate(req.tutorialQuiz, {
        // find groups with members
        path: 'groups',
        model: models.Group,
        populate: [{
            path: 'members',
            model: models.User,
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }, {
            path: 'driver'
        }]
    }, function (err) {
        res.render('admin/quiz-groups', { 
            course: req.course, 
            tutorialQuiz: req.tutorialQuiz 
        });
    });
};

// Create new group for tutorial
exports.generateGroups = function (req, res) { 
    // delete original groups
    models.Group.remove({ _id: { $in: req.tutorialmodels.Quiz.groups } }, function (err) {
        // clear groups from tutorial + quiz
        req.tutorialmodels.Quiz.groups = [];
        // randomize + split students into groups
        var chunks = _.chunk(_.shuffle(req.tutorial.students), 3);
        // create new groups in tutorial + quiz
        async.eachOfSeries(chunks, function (members, n, done) {
            models.Group.create({ 
                name: n + 1, 
                members: members
            }, function (err, group) {
                req.tutorialmodels.Quiz.groups.push(group);
                done();
            });
        }, function (err) {
            // add groups to tutorial
            req.tutorialmodels.Quiz.save(function (err) {
                res.redirect(
                    '/admin/courses/' + req.course.id + 
                    '/tutorials/' + req.tutorial.id + 
                    '/quizzes/' + req.tutorialmodels.Quiz.id +
                    '/groups'
                ); 
            });
        });
    });
};

// Delete group
exports.deleteGroup = function (req, res) { };