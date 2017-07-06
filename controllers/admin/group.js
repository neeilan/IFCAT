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
    models.TutorialQuiz.findOne({ tutorial: req.tutorial, quiz: req.quiz }).populate({
        path: 'tutorial',
        populate: {
            path: 'students',
            model: models.User,
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }).exec((err, tutorialQuiz) => {
        // shuffle students
        let students = _.shuffle(req.tutorial.students.map(String));
        // split into chunks of size + shuffle chunks
        let chunks = _.chunk(students, tutorialQuiz.maxMembersPerGroup);
        // map chunks to groups
        let groups = _.map(chunks, (members, i) => new models.Group({ name: i + 1, members: members }));

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
    console.log(req.body.groups)

    req.body.groups = req.body.groups || {};

    let tutorialQuiz;

    async.series([
        done => {
            models.TutorialQuiz.findOne({ tutorial: req.tutorial, quiz: req.quiz }).populate('groups').exec((err, doc) => {
                if (err)
                    return done(err);
                if (!doc)
                    return done(new Error('No tutorial quiz'));
                if (doc.archived)
                    return done(new Error('Cannot update archived tutorial quiz'));
                tutorialQuiz = doc;
                done();
            });
        },
        done => {
            async.eachSeries(tutorialQuiz.groups, (self, done) => {
                // remove existing group if it is not present
                if (!req.body.groups.hasOwnProperty(self._id))
                    return self.remove(done);
                // otherwise update existing group
                self.update({ $set: { members: req.body.groups[self._id] }}, done);
            }, done);
        },
        done => {
            async.eachOfSeries(req.body.groups, (members, name, done) => {
                if (!name.startsWith('$'))
                    return done();
                // add new group
                models.Group.create({ name: name.slice(1), members: members }, (err, group) => {
                    if (err)
                        return done(err);
                    tutorialQuiz.update({ $addToSet: { groups: group._id }}, done);
                });
            }, done);
        }
    ], err => {
        console.log(err)
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', '<b>%s</b> groups have been updated for <b>TUT %s</b>.', req.quiz.name, req.tutorial.number);
        res.redirect(`/admin/courses/${req.course._id}/tutorials/${req.tutorial._id}/quizzes/${req.quiz._id}/conduct`);
    });
};

// function diffGroup(before, after) {
//     diffSet = new Set();
//     for (let member in before) {
//         let id = member._id || member;
//         diffSet.add(id);
//         console.log(id);
//     }
//     for (let member in after) {
//         let id = member._id || member;
//         if (diffSet.has(id)) {
//             // was already present, so not part of diff
//             diffSet.delete(id);
//         } else {
//             diffSet.add(id);
//         }
//     }
//     return diffSet;
// };
