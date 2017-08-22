const models = require('../../models');
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
exports.getCourses = (req, res, next) => {
    let conditions = {};
    // filter courses based on role
    if (!req.user.hasRole('admin')) {
        conditions.$or = [];
        if (req.user.hasRole('instructor'))
            conditions.$or.push({ instructors: { $in: [req.user._id] }});
        if (req.user.hasRole('teachingAssistant'))
            conditions.$or.push({ teachingAssistants: { $in: [req.user._id] }});
    }
    models.Course.find(conditions, 'name code').sort('code').lean().exec((err, courses) => {
        if (err)
            return next(err);
        res.render('admin/pages/courses', {
            bodyClass: 'courses-page',
            title: 'Courses',
            courses: courses
        });
    });
};
// Get form for course
exports.getCourse = (req, res, next) => {
    let course = req.course || new models.Course();
    res.render('admin/pages/course', {
        bodyClass: 'course-page',
        title: course.isNew ? 'Add New Course' : 'Edit Course',
        course: course 
    });
};
// Add course
exports.addCourse = (req, res, next) => {
    models.Course.create(req.body, (err, course) => {
        if (err)
            return next(err);
        req.flash('success', 'Course <b>%s</b> has been created.', course.name);
        res.redirect('/admin/courses');
    });
};
// Update course
exports.editCourse = (req, res, next) => {
    req.course.set(req.body).save(err => {
        if (err)
            return next(err);
        req.flash('success', 'Course <b>%s</b> has been updated.', req.course.name);
        res.redirect('back');
    });
};
// Delete course
exports.deleteCourse = (req, res, next) => {
    req.course.remove(err => {
        if (err)
            return next(err);
        req.flash('success', 'Course <b>%s</b> has been deleted.', req.course.name);
        res.redirect('back');
    });
};