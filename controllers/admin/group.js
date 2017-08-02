const _ = require('../../lib/lodash.mixin'),
    async = require('async'),
    models = require('../../models'),
    mongoose = require('mongoose');
// Retrieve group
exports.getGroupByParam = (req, res, next, id) => {
    models.Group.findById(id, (err, group) => {
        if (err) return next(err);
        if (!group) return next(new Error('No group is found.'));
        req.group = group;
        next();
    });
};
// Temporarily generate groups
exports.generateGroups = (req, res, next) => {
    req.tutorialQuiz.populate([{
        path: 'tutorial',
        model: 'Tutorial',
        populate: {
            path: 'students',
            model: 'User',
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }
    }, {
        path: 'quiz',
        model: 'Quiz'
    }]).execPopulate().then(() => {
        // shuffle students
        let students = _.shuffle(_.map(req.tutorialQuiz.tutorial.students, '_id'));
        // split into chunks of size + shuffle chunks
        let chunks = _.chunk(students, req.tutorialQuiz.maxMembersPerGroup);
        // map chunks to groups
        let groups = _.map(chunks, (members, i) => new models.Group({ name: i + 1, members: members }));
        // add warning
        req.flash('warning', 'Below is an <b><u>unsaved</u></b> list of new groups.');
        res.locals.flash = req.flash();

        res.render('admin/pages/tutorial-quiz', {
            bodyClass: 'tutorial-quiz-page',
            title: `Conduct ${req.tutorialQuiz.quiz.name} in Tutorial ${req.tutorialQuiz.tutorial.number}`,
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            tutorial: req.tutorialQuiz.tutorial,
            quiz: req.tutorialQuiz.quiz,
            students: req.tutorialQuiz.tutorial.students,
            groups: groups
        });
    }, next);
};
// Save groups for tutorial
exports.saveGroups = (req, res, next) => {
    let dict = _.transpose(req.body['+users'] || {});
    async.series([
        done => {
            req.tutorialQuiz.populate('tutorial quiz groups', done);
        },
        done => {
            // update existing groups
            async.eachSeries(req.tutorialQuiz.groups, (group, done) => {
                let members = group.members.map(String);
                    members = _.difference(members, req.body.users);
                    members = _.union(members, dict[group._id]);
                    delete dict[group._id]; // mark as done
                group.members = members;
                if (!group.members.length) {
                    return group.remove(err => {
                        if (err) return done(err);
                        req.tutorialQuiz.update({ $pull: { groups: group._id }}, done);
                    });
                }
                group.save(done);
            }, done);
        },
        done => {
            // add remaining (new) groups
            async.eachOfSeries(dict, (members, name, done) => {
                models.Group.create({ name: name, members: members }, (err, group) => {
                    if (err) return done(err);
                    req.tutorialQuiz.update({ $push: { groups: group._id }}, done);
                });
            }, done);
        }
    ], err => {
        if (err) return next(err);
        req.flash('success', '<b>%s</b> groups have been updated for <b>TUT %s</b>.', req.tutorialQuiz.quiz.name, req.tutorialQuiz.tutorial.number);
        res.send(`/admin/courses/${req.course._id}/tutorials-quizzes/${req.tutorialQuiz._id}`);
    });
};