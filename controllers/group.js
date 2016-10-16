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
        //console.log('got group');
        req.group = group;
        next();
    });
};
// Retrieve list of groups for tutorial
exports.getGroupList = function (req, res) { 
    req.tutorialQuiz.withStudents().withGroups().execPopulate().then(function (err) {
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
        var size = req.tutorialQuiz.max.membersPerGroup;
        if (req.tutorialQuiz.max.groups) {
            size = Math.ceil(students.length / req.tutorialQuiz.max.groups); 
        }
        // split into chunks of size
        var chunks = _.chunk(students, size);
        // map chunks to groups
        var groups = _.map(chunks, function (chunk, i) {
            return {
                id: i + 1,
                name: i + 1,
                members: chunk
            };
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
exports.saveGroupList = function (req, res) { 
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
        async.each(req.tutorialQuiz.groups, function (group, done) {
            //console.log(req.tutorialQuiz.groups.length);
            // update existing groups
            if (newGroups.hasOwnProperty(group._id)) {
                //console.log('updating', group._id);
                group.members = newGroups[group._id];
                delete newGroups[group._id];
                group.save(done);
            // delete existing groups
            } else {
                //console.log('deleting', group._id);
                group.remove(function (err) {
                    req.tutorialQuiz.groups.pull({ _id: group._id });
                    req.tutorialQuiz.save(done);
                });
            }
        }, function (err) {
            //console.log('err1', err);
            // add new groups
            async.eachOfSeries(newGroups, function (members, name, done) {
                //console.log('adding', name);
                models.Group.create({ name: name, members: members }, function (err, group) {
                    req.tutorialQuiz.groups.push(group);
                    req.tutorialQuiz.save(done);
                });
            }, function (err) {
                //console.log('err2', err);
                res.json({ status: true });
            });
        });
    });
};