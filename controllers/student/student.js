const models = require('../../models');
// Retrieve courses enrolled for student
exports.getCourses = (req, res) => {
    models.Course.find({ 'students': { $in: [req.user._id] }}).sort('code').exec((err, courses) => { 
        res.render('student/courses', { courses: courses });
    });
};
// Retrieve quizzes within course
exports.getQuizzes = (req, res) => {
    req.course.populate({ 
        path: 'tutorials',
        match: {
            students: { $in: [req.user._id] }
        }
    }).execPopulate().then(() => {
        // TODO: handle this better
        if (!req.course.tutorials.length)
            return res.redirect('student/courses');
        // find tutorial quizzes
        models.TutorialQuiz.find({ tutorial: req.course.tutorials[0]._id, published: true }).populate('quiz').exec((err, tutorialQuizzes) => {
            res.render('student/tutorial-quizzes', { 
                course: req.course,
                tutorial: tutorial,
                tutorialQuizzes: tutorialQuizzes
            });
        });
    });
};