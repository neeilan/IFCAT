const models = require('../../models');
// Retrieve list of instructors for course
exports.getInstructorsByCourse = (req, res) => {
    req.course.withInstructors().execPopulate().then(() => {
        res.render('admin/course-instructors', { 
            bodyClass: 'instructors',
            title: 'Instructors',
            course: req.course
        });
    });
};
// Retrieve list of instructors matching search query
exports.getInstructorsBySearchQuery = (req, res) => {
    models.User.findBySearchQuery({ q: req.query.q, roles: ['instructor'] }, (err, instructors) => {
        res.render('admin/tables/course-instructors-search-results', { 
            course: req.course, 
            instructors: instructors
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