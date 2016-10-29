var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');
    
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
        req.group = group;
        next();
    });
};
// Retrieve list of groups for tutorial
exports.getGroupList = function (req, res) { 
    req.tutorialQuiz.withStudents().withGroups().execPopulate().then(function () {
        res.render('admin/quiz-groups', {
            title: 'Groups',
            course: req.course, 
            tutorialQuiz: req.tutorialQuiz,
            tutorial: req.tutorialQuiz.tutorial,
            quiz: req.tutorialQuiz.quiz,
            groups: req.tutorialQuiz.groups,
            students: req.tutorialQuiz.tutorial.students
        });
    });
};
// Temporarily generate groups
exports.generateGroupList = function (req, res) {
    // get students within tutorial
    req.tutorialQuiz.withStudents().execPopulate().then(function () {
        // randomize students
        var students = _.shuffle(req.tutorialQuiz.tutorial.students);
        // determine number of members per group
        var size = _.toInteger(req.tutorialQuiz.max.membersPerGroup);
        if (_.isInteger(req.tutorialQuiz.max.groups)) {
            size = Math.ceil(students.length / req.tutorialQuiz.max.groups); 
        }
        // split into chunks of size
        var chunks = _.chunk(students, size);
        // map chunks to groups
        var groups = _.map(chunks, function (chunk, i) {
            return { id: i + 1, name: i + 1, members: chunk };
        });

        res.render('admin/quiz-groups', {
            title: 'Groups',
            course: req.course, 
            tutorialQuiz: req.tutorialQuiz,
            tutorial: req.tutorialQuiz.tutorial,
            quiz: req.tutorialQuiz.quiz,
            groups: groups,
            students: req.tutorialQuiz.tutorial.students
        });
    });
};
// Create new group for tutorial
exports.saveGroupList = function (req, res, next) { 
    // sort groups
    var newGroups = {};
    _.each(req.body.groups, function (idName, studentId) {
        if (idName !== 'unassigned') {
            if (!newGroups.hasOwnProperty(idName)) {
                newGroups[idName] = [];
            }
            newGroups[idName].push(studentId);
        }
    });

    //console.log('new',newGroups);

    req.tutorialQuiz.withGroups().execPopulate().then(function () {
        async.series([
            function updOldGrps(done) {
                async.each(req.tutorialQuiz.groups, function (group, done) {
                    if (newGroups.hasOwnProperty(group._id)) {
                        group.update({ $set: { members: newGroups[group._id] }}, function (err) {
                            if (err) {
                                return done(err);
                            }
                            delete newGroups[group._id]; // mark as processed
                            done();
                        });
                    } else {
                        group.remove(function (err) {
                            if (err) {
                                return done(err);
                            }
                            req.tutorialQuiz.update({ $pull: { groups: group.id }}, done);
                        });
                    }
                }, done);
            },
            function addNewGrps(done) {
                async.eachOfSeries(newGroups, function (members, name, done) {
                    models.Group.create({ name: name, members: members }, function (err, group) {
                        if (err) {
                            return done(err);
                        }
                        req.tutorialQuiz.update({ $addToSet: { groups: group._id }}, done);
                    });
                }, done);
            }
        ], function (err) {
            if (err) {
                console.error(err);
                req.flash('error', 'An error occurred while trying to perform operation.');
            } else {
                req.flash('success', 'The list of groups have been updated.');
            }
            res.json({ status: !err });
        });
    });
};