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
        console.log('got group');
        req.group = group;
        next();
    });
};
// Retrieve list of groups for tutorial
exports.getGroupList = function (req, res) { 
    req.tutorialQuiz.withStudents().withGroups().execPopulate().then(function (err) {

        console.log( req.tutorialQuiz.groups );

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

        console.log( groups );

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
    var groups = {};
    _.each(req.body.groups, function (groupId, studentId) {
        if (!_.has(groups, groupId)) {
            groups[groupId] = [];
        }
        groups[groupId].push(studentId);
    });
    // keep track of which groups were modified
    var ids = [];
    // update existing groups
    async.eachOfSeries(groups, function (members, id, done) {
        // skip unassigned groups
        if (id === 'unassigned') {
            done();
        // create new group in tutorialQuiz
        } else if (!isNaN(id)) {
            models.Group.create({ name: id, members: members }, function (err, group) {
                // mark group as modified
                ids.push(group.id);
                req.tutorialQuiz.groups.push(group.id);
                req.tutorialQuiz.save(done);
            });
         // update existing group
        } else if (mongoose.Types.ObjectId.isValid(id)) {
            models.Group.findById(id, function (err, group) {
                // mark group as modified
                ids.push(group.id);
                // check if changes are needed
                if (_.isEqual(
                        group.members.slice().sort().toString(), 
                        members.slice().sort().toString()
                    )) {
                    done();
                } else {
                    group.members = members;
                    group.save(done);
                }
            });
        }
    // delete members from other groups
    }, function (err) {
        models.Group.remove({ 
            $and: [{
                _id: {
                    $nin: ids
                }
            }, {
                _id: {
                    $in: req.tutorialQuiz.groups
                }
            }]
        }, function (err) {
            if (err) {
                req.flash('failure', 'Unable to save groups at this time.');
            } else {
                req.flash('success', 'The groups have been updated successfully.');
            }
            res.json({ status: true });
        });
    });
};