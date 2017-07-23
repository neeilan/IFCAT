const _ = require('../../lib/lodash.mixin'),
    async = require('async'),
    models = require('../../models');
// Retrieve list of teaching assistants for course
exports.getTeachingAssistantsByCourse = (req, res) => {
    req.course.withTutorials().withTeachingAssistants().execPopulate().then(err => {
        res.render('admin/pages/course-teaching-assistants', {
            bodyClass: 'teaching-assistants',
            title: 'Teaching Assistants',
            course: req.course
        });
    });
};
// Retrieve list of teaching assistants matching search query
exports.getTeachingAssistantsBySearchQuery = (req, res) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 5,
        re = new RegExp(`(${req.query.q.replace(/\s/g, '|').trim()})`, 'i');
    models.User.findAndCount({
        $and: [
            { $or: [{ 'name.first': re },{ 'name.last': re },{ 'local.email': re }] },
            { roles: { $in: ['teachingAssistant'] }}
        ]
    }, {
        select: 'name local.email',
        page: page,
        perPage: perPage,
        sort: 'name.first name.last'
    }, (err, users, count, pages) => {
        res.render('admin/partials/course-teaching-assistants-search-results', { 
            course: req.course, 
            teachingAssistants: users,
            pagination: {
                count: `${count} user${count !== 1 ? 's' : ''} matched`,
                page: page,
                pages: pages,
                params: {
                    q: req.query.q
                }
            }
        });
    });
};
// Add teaching assistants into course
exports.addTeachingAssistants = (req, res) => {
    let users = req.body.users || [];
    req.course.update({ $addToSet: { teachingAssistants: { $each: users }}}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'List of teaching assistants has been updated.');
        res.redirect(`/admin/courses/${req.course.id}/teaching-assistants`);
    });
};
// Update teaching assistants in tutorials
exports.editTeachingAssistants = (req, res) => {
    let dict = _.transpose(req.body['+users'] || {});
    models.Tutorial.find({ _id: req.course.tutorials }, (err, tutorials) => {
        async.eachSeries(tutorials, (tutorial, done) => {
            let assistants = tutorial.teachingAssistants.map(String);
                assistants = _.difference(assistants, req.body.users);
                assistants = _.union(assistants, dict[tutorial._id]);
            tutorial.update({ teachingAssistants: assistants }, done);
        }, err => {
            if (err)
                return res.status(400).send('An error occurred while trying to perform operation.');
            res.send('The list of tutorials has been updated.');
        });
    });
};
// Delete teaching assistants from course and associated tutorials
exports.deleteTeachingAssistants = (req, res) => {
    let users = req.body['-users'] || [];
    async.series([
        done => {
            req.course.update({ $pull: { teachingAssistants: { $in: users }}}, done);
        },
        done => {
            models.Tutorial.update({ 
                _id: { $in: req.course.tutorials }
            }, { 
                $pull: { teachingAssistants: { $in: users }}
            }, {
                multi: true
            }, done);
        }
    ], err => {
        if (err)
            return res.status(400).send('An error occurred while trying to perform operation.');
        res.send('List of teaching assistants has been updated.');
    });
};