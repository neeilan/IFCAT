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
            students: req.tutorialQuiz.tutorial.students,
            unassignedStudents: req.tutorialQuiz.unassignedStudents
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
        // map chunks to groups (TO-FIX)
        var groups = _.map(chunks, function (chunk, i) {
            return { id: i + 1, name: i + 1, members: chunk };
        });

        console.log(size, chunks);



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
// Save groups for tutorial
exports.saveGroupList = function (req, res, next) { 
    var newGroups = {},
        trash = req.body.trash || [];
    // idName = group id (update), number (new), or 'unassigned' (ignored)
    // sort groups keyed on idName, value is array of userIds
    _.each(req.body.groups || {}, function (idName, userId) {
        if (idName !== 'unassigned') {
            if (!newGroups.hasOwnProperty(idName))
                newGroups[idName] = [];
            if (mongoose.Types.ObjectId.isValid(userId))
                newGroups[idName].push(userId);
        }
    });

    req.tutorialQuiz.withGroups().execPopulate().then(function () {
        async.series([
            function updateGroups(done) {
                async.each(req.tutorialQuiz.groups, function (group, done) {
                    // delete group if it was marked as trash
                    if (trash.indexOf(group.id) !== -1) {
                        group.remove(function (err) {
                            if (err)
                                return done(err);
                            req.tutorialQuiz.update({ $pull: { groups: group.id }}, done);
                        });
                    // otherwise update group members
                    } else {
                        group.update({ $set: { members: newGroups[group.id] || [] }}, function (err) {
                            if (err)
                                return done(err);
                            delete newGroups[group.id]; // done!
                            done();
                        });
                    }
                }, done);
            },
            function addGroups(done) {
                async.eachOfSeries(newGroups, function (members, name, done) {
                    models.Group.create({ name: name, members: members }, function (err, group) {
                        if (err)
                            return done(err);
                        req.tutorialQuiz.update({ $addToSet: { groups: group._id }}, done);
                    });
                }, done);
            }
        ], function (err) {
            if (err)
                return res.status(500).send('An error occurred while trying to perform action.');
            res.send('List of groups has been updated.');
        });
    });
};
