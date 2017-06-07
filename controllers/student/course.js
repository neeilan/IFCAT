var models = require('../../models');
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