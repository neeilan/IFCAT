const _ = require('lodash'),
    async = require('async'),
    models = require('../../models');
// Retrieve course
exports.getCourseByParam = (req, res, next, id) => {
    models.Course.findById(id, (err, course) => {
        if (err)
            return next(err);
        if (!course)
            return next(new Error('No course is found.'));
        req.course = course;
        next();
    });
};
// Retrieve many courses
exports.getCourses = (req, res) => {
    models.Course.find().sort('code').lean().exec((err, courses) => {
        res.render('admin/pages/courses', {
            bodyClass: 'courses',
            title: 'Courses',
            courses: _.filter(courses,  course => {
                return req.user.hasRole('admin') ||
                    course.instructors.indexOf(req.user.id) !== -1 ||
                    course.teachingAssistants.indexOf(req.user.id) !== -1;
            }) 
        });
    });
};
// Get form for course
exports.getCourse = (req, res) => {
    let course = req.course || new models.Course();
    res.render('admin/pages/course', {
        bodyClass: 'course',
        title: course.isNew ? 'Add New Course' : 'Edit Course',
        course: course 
    });
};
// Add course
exports.addCourse = (req, res) => {
    models.Course.create(req.body, (err, course) => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been created.', course.name);
        res.redirect('/admin/courses');
    });
};
// Update course
exports.editCourse = (req, res) => {
    req.course.set(req.body).save(err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been updated.', req.course.name);
        res.redirect(`/admin/courses/${req.course.id}/edit`);
    });
};
// Delete course
exports.deleteCourse = (req, res) => {
    req.course.remove(err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else
            req.flash('success', 'Course <b>%s</b> has been deleted.', req.course.name);
        res.sendStatus(200);
    });
};