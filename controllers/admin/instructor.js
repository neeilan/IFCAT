const models = require('../../models');
// Retrieve list of instructors for course
exports.getInstructorsByCourse = (req, res) => {
    req.course.withInstructors().execPopulate().then(() => {
        res.render('admin/pages/course-instructors', { 
            bodyClass: 'instructors',
            title: 'Instructors',
            course: req.course
        });
    });
};
// Retrieve list of instructors matching search query
exports.getInstructorsBySearchQuery = (req, res) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 5,
        re = new RegExp(`(${req.query.q.replace(/\s/, '|').trim()})`, 'i');
    models.User.findAndCount({
        $and: [
            { $or: [{ 'name.first': re },{ 'name.last': re },{ 'local.email': re }] },
            { roles: { $in: ['instructor'] }}
        ]
    }, {
        select: 'name local.email',
        page: page,
        perPage: perPage,
        sort: 'name.first name.last'
    }, (err, users, count, pages) => {
        res.render('admin/partials/course-instructors-search-results', { 
            course: req.course, 
            instructors: users,
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
// Add instructor to course
exports.addInstructors = (req, res) => {
    req.course.update({ $addToSet: { instructors: { $each: req.body.instructors || [] }}}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The list of instructors has been updated for the course.');
        res.redirect(`/admin/courses/${req.course.id}/instructors`);
    });  
};
// Delete instructor from course
exports.deleteInstructors = (req, res) => {
    req.course.update({ $pull: { instructors: { $in: req.body.instructors || [] }}}, err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'The list of instructors has been updated for the course.');
        res.sendStatus(200);
    }); 
};