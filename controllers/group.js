var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');
var config = require('../lib/config'),
    models = require('../models');

// Retrieve group
exports.getGroup = function (req, res, next, group) { 
    models.Group.findById(group).exec(function (err, group) {
        if (err)
            return next(err);
        if (!group)
            return next(new Error('No group is found.'));
        req.group = group;
        next();
    });
};
// Get groups
exports.getGroupList = function (req, res) {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate({
        path: 'groups',
        options: {
            sort: { 'name': 1 }
        },
        populate: {
            path: 'members',
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }
    }).exec(function (err, tutorialQuiz) {
        res.render('admin/groups', {
            title: 'Groups',
            course: req.course, 
            tutorial: req.tutorial,
            quiz: req.quiz,
            tutorialQuiz: tutorialQuiz,
            groups: tutorialQuiz.groups
        });
    });
};
// Temporarily generate groups
exports.generateGroupList = function (req, res) {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate({
        path: 'tutorial',
        populate: {
            path: 'students',
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }).exec(function (err, tutorialQuiz) {
        // shuffle students
        var students = _.shuffle(req.tutorial.students.map(String));
        // get # of members per group
        var size = tutorialQuiz.max.membersPerGroup;
        // split into chunks of size + shuffle chunks
        var chunks = _.shuffle(_.chunk(students, size));
        // map chunks to groups
        var groups = _.map(chunks, function (chunk, i) {
            return {
                id: i + 1,
                name: i + 1,
                members: chunk
            };
        });

        res.render('admin/tutorial-quiz', {
            title: 'Conduct ' + req.quiz.name + ' in TUT ' + req.tutorial.number,
            course: req.course, 
            tutorial: req.tutorial,
            quiz: req.quiz,
            tutorialQuiz: tutorialQuiz,
            students: tutorialQuiz.tutorial.students,
            groups: groups,
            flash: {
                'warning': ['Below is an <b><u>unsaved</u></b> list of new groups.']
            }
        });
    });
};
// Save groups for tutorial
exports.saveGroupList = function (req, res, next) { 
    var stack = {}, trash = req.body.trash || [];
    // key might be group ID (for updating), number (adding), or a string (to be ignored)
    // value is set of user IDs
    _.each(req.body.groups || {}, function (key, userId) {
        if ((mongoose.Types.ObjectId.isValid(key) || (key && !isNaN(key))) && mongoose.Types.ObjectId.isValid(userId)) {
            if (!stack.hasOwnProperty(key))
                stack[key] = [];
            stack[key].push(userId);
        }
    });

    models.TutorialQuiz
        .findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate('groups')
        .exec(function (err, tutorialQuiz) {
        async.series([
            function updateGroups(done) {
                async.each(tutorialQuiz.groups, function (group, done) {
                    var members = stack[group.id];
                    // delete group if it was marked as trash or empty
                    if (trash.indexOf(group.id) > -1 || !members) {
                        group.remove(function (err) {
                            if (err)
                                return done(err);
                            tutorialQuiz.update({ $pull: { groups: group.id }}, done);
                        });
                    // otherwise update group members
                    } else {
                        group.update({ $set: { members: members }}, function (err) {
                            if (err)
                                return done(err);
                            delete stack[group.id];
                            done();
                        });
                    }
                }, done);
            },
            function addGroups(done) {
                // what's left: add group
                async.eachOfSeries(stack, function (members, name, done) {
                    models.Group.create({ name: name, members: members }, function (err, group) {
                        if (err)
                            return done(err);
                        tutorialQuiz.update({ $addToSet: { groups: group.id }}, done);
                    });
                }, done);
            }
        ], function (err) {
            if (err)
                res.flash('error', 'An error occurred while trying to perform action.');
            else
                req.flash('success', '<b>%s</b> groups have been updated for <b>TUT %s</b>.', req.quiz.name, req.tutorial.number);
            res.redirect(
                '/admin/courses/' + req.course.id + 
                '/tutorials/' + req.tutorial.id + 
                '/quizzes/' + req.quiz.id + 
                '/conduct'
            );
        });
    });
};
