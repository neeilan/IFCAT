const async = require('async'),
    config = require('../lib/config'),
    models = require('../models');
// Retrieve list of teaching assistants for course
exports.getTeachingAssistantsByCourse = (req, res) => {
    req.course.withTutorials().withTeachingAssistants().execPopulate().then(err => {
        res.render('admin/course-teaching-assistants', {
            bodyClass: 'teaching-assistants',
            title: 'Teaching Assistants',
            course: req.course
        });
    });
};
// Retrieve list of teaching assistants matching search query
exports.getTeachingAssistantsBySearchQuery = (req, res) => {
    models.User.findBySearchQuery({ q: req.query.q, roles: ['teachingAssistant'] }, (err, teachingAssistants) => {
        res.render('admin/tables/course-teaching-assistants-search-results', { 
            course: req.course, 
            teachingAssistants: teachingAssistants
        });
    });
};
// Add teaching assistants into course
exports.addTeachingAssistants = (req, res) => {
    req.course.update({ $addToSet: { teachingAssistants: { $each: req.body.teachingAssistants || [] }}}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'List of teaching assistants has been updated.');
        res.redirect(`/admin/courses/${req.course.id}/teaching-assistants`);
    });
};
// Update teaching assistants in tutorials
exports.editTeachingAssistants = (req, res) => {
    req.body.tutorials = req.body.tutorials || {};
    req.course.withTutorials().execPopulate().then(() => {
        async.eachSeries(req.course.tutorials, (tutorial, done) => {
            tutorial.update({ $set: { teachingAssistants: req.body.tutorials[tutorial._id] || [] }}, done);
        }, err => {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'The list of tutorials has been updated.');
            res.sendStatus(200);
        });
    });
};
// Delete teaching assistants from course and associated tutorials
exports.deleteTeachingAssistants = (req, res) => {
    let teachingAssistants = req.body.teachingAssistants || [];
    async.series([
        done => {
            req.course.update({ 
                $pull: { teachingAssistants: { $in: teachingAssistants }}
            }, done);
        },
        done => {
            models.Tutorial.update({ 
                _id: { $in: req.course.tutorials }
            }, { 
                $pull: { teachingAssistants: { $in: teachingAssistants }}
            }, {
                multi: true
            }, done);
        }
    ], err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'List of teaching assistants has been updated.');
        res.sendStatus(200);
    });
};