const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    models = require('../../models'),
    mongoose = require('mongoose');
// Retrieve group
exports.getGroupByParam = (req, res, next, id) => { 
    models.Group.findById(id, (err, group) => {
        if (err)
            return next(err);
        if (!group)
            return next(new Error('No group is found.'));
        req.group = group;
        next();
    });
};
// Temporarily generate groups
exports.generateGroups = (req, res) => {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate({
        path: 'tutorial',
        populate: {
            path: 'students',
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }).exec((err, tutorialQuiz) => {
        // shuffle students
        var students = _.shuffle(req.tutorial.students.map(String));
        // get # of members per group
        var size = tutorialQuiz.max.membersPerGroup;
        // split into chunks of size + shuffle chunks
        var chunks = _.shuffle(_.chunk(students, size));
        // map chunks to groups
        var groups = _.map(chunks, function (chunk, i) {
            return {
                id: '<' + (i + 1) + '>',
                name: i + 1,
                members: chunk
            };
        });
        res.render('admin/pages/tutorial-quiz', {
            class: 'conduct-quiz',
            title: `Conduct ${req.quiz.name} in TUT ${req.tutorial.number}`,
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
exports.saveGroups = (req, res, next) => { 
    var oldStack = {}, newStack = {};
    // key might be group ID (for updating) or <number> (for adding)
    _.forOwn(req.body.groups || {}, function (users, groupId) {
        if (mongoose.Types.ObjectId.isValid(groupId))
            oldStack[groupId] = _.keys(users).sort();
        else
            newStack[groupId.replace(/[^\d]/g, '')] = _.keys(users).sort();
    });
    // console.log(req.body, oldStack, newStack)
    
    async.waterfall([
        function findTutorialQuiz(done) {
            models.TutorialQuiz.findOne({  
                tutorial: req.tutorial.id,  
                quiz: req.quiz.id, 
                archived: false // safety measure
            }).populate('groups').exec(function (err, tutorialQuiz) {
                if (err)
                    return done(err);
                if (!tutorialQuiz)
                    return done(new Error('No tutorial quiz'));
                done(null, tutorialQuiz);
            });
        },
        function updateGroups(tutorialQuiz, done) {
            async.each(tutorialQuiz.groups, function (group, done) {
                // update non-empty groups
                if (oldStack.hasOwnProperty(group.id) && oldStack[group.id]) {
                    group.update({ $set: { members: oldStack[group.id] }}, function (err) {
                        if (err)
                            return done(err);
                        delete oldStack[group.id]; // processed
                        done();
                    });
                // otherwise delete group
                } else {
                    group.remove(function (err) {
                        if (err)
                            return done(err);
                        delete oldStack[group.id]; // processed
                        tutorialQuiz.update({ $pull: { groups: group.id }}, done);
                    });
                }
            }, function (err) {
                done(err, tutorialQuiz);
            });
        },
        function addGroups(tutorialQuiz, done) {
            // what's left: add group
            async.eachOfSeries(newStack, function (members, name, done) {
                models.Group.create({ name: name, members: members }, function (err, group) {
                    if (err)
                        return done(err);
                    delete newStack[name]; // processed
                    tutorialQuiz.update({ $addToSet: { groups: group.id }}, done);
                });
            }, done);
        }
    ], function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', '<b>%s</b> groups have been updated for <b>TUT %s</b>.', req.quiz.name, req.tutorial.number);
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorials/' + req.tutorial.id + 
            '/quizzes/' + req.quiz.id + 
            '/conduct'
        );
    });
};
