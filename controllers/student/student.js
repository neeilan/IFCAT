const models = require('../../models');
// Retrieve courses enrolled for student
exports.getCourses = (req, res) => {
    models.Course.find({ 'students': { $in: [req.user._id] }}).sort('code').exec((err, courses) => { 
        res.render('student/courses', { courses: courses });
    });
};
// Retrieve quizzes within course
exports.getQuizzes = (req, res) => {
    req.course.withTutorials().execPopulate().then(() => {
        // find tutorial that student is in
        let tutorial = req.course.tutorials.find(tutorial => tutorial.hasStudent(req.user.id));
        //console.log('tutorial', tutorial);
        // TODO: handle this better
        if (!tutorial)
            return res.redirect('student/courses');
        //console.log('find tutorial quizzes');
        // find tutorial quizzes
        model.TutorialQuizzes.find({ tutorial: tutorial._id, published: true }).populate('quiz').exec((err, tutorialQuizzes) => {
            //console.log('err', err);
            res.render('student/tutorial-quizzes', { 
                course: req.course,
                tutorial: tutorial,
                tutorialQuizzes: tutorialQuizzes
            });
        });
    });
};