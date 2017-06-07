const models = require('../../models');
// Retrieve courses enrolled for student
exports.getCourses = (req, res) => {
    models.Course.findByStudent(req.user.id).exec((err, courses) => { 
        res.render('student/courses', { courses: courses });
    });
};
// Retrieve quizzes within course
exports.getQuizzes = (req, res) => {
    req.course.withTutorials().execPopulate().then(() => {
        // find tutorials that student is in
        var tutorials = req.course.tutorials.filter(tutorial => {
            return tutorial.students.indexOf(req.user.id) > -1;
        });
        // find tutorial quizzes
        if (tutorials) {
            models.TutorialQuiz.find({ tutorial: tutorials[0].id, published: true }).populate('quiz').exec(function (err, tutorialQuizzes) {
                // //console.log('tutorial', tutorials[0]);
                // //console.log('tutorialQuizzes', tutorialQuizzes);
                res.render('student/tutorial-quizzes', { 
                    course: req.course,
                    tutorial: tutorials[0],
                    tutorialQuizzes: tutorialQuizzes 
                });
            });
        }
    });
};