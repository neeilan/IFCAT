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
    req.tutorialQuiz.withStudents().withGroups().execPopulate().then(function (err) {
        res.render('admin/quiz-groups', { 
            course: req.course, 
            tutorialQuiz: req.tutorialQuiz 
        });
    });
};
// Temporarily generate groups
exports.generateGroups = function (req, res) {
    // get students within tutorial
    req.tutorialQuiz.withStudents().execPopulate().then(function () {
        // randomize students
        var students = _.shuffle(req.tutorialQuiz.tutorial.students), maxMembersPerGroup;
        // determine number of members per group
        if (req.tutorialQuiz.max.groups) {
            maxMembersPerGroup = Math.ceil(students.length / req.tutorialQuiz.max.groups); 
        } else {
            maxMembersPerGroup = req.tutorialQuiz.max.membersPerGroup;
        }
        // split students into groups according to maximum size
        var groups = [], members = [];
        for (var i = 0; i < students.length; i++) {
            // group size reached
            if (maxMembersPerGroup && members.length === maxMembersPerGroup) {
                // add new group
                groups.push({ members: members });
                // start a new group
                members = [];
            }
            // add student to group
            members.push(students[i]);
            // add last group
            if (i + 1 === students.length) {
                groups.push({ members: members });
            }
        }
        res.json({ groups: groups });
    });
};

// Create new group for tutorial
exports.saveGroups = function (req, res) { 
    // delete original groups
    /*models.Group.remove({ _id: { $in: req.tutorialQuiz.groups } }, function (err) {
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
    });*/
};

// Delete group
exports.deleteGroup = function (req, res) { };