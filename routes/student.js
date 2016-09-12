var passport = require('passport'),
    router = require('express').Router();

var controllers = require('../controllers');

// non-authenticated routes
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

// lifesaver: query single objects
router.param('course', controllers.Course.getCourse);
router.param('tutorial', controllers.Tutorial.getTutorial);
router.param('group', controllers.Group.getGroup);
router.param('quiz', controllers.Quiz.getQuiz);
router.param('question', controllers.Question.getQuestion);
router.param('fil3', controllers.File.getFile);
router.param('tutorialQuiz', controllers.TutorialQuiz.getQuiz);

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
});

// authenticated routes
router.get('/logout', controllers.User.logout);

router.get('/courses', controllers.Course.getEnrolledCourseList);
//router.get('/courses/:course/quizzes', controllers.TutorialQuiz.getQuizzesForStudent);
router.get('/courses/:course/quizzes/:tutorialQuiz/start', controllers.TutorialQuiz.startQuiz);
router.get('/courses/:course/quizzes/:tutorialQuiz/questions/:question', controllers.TutorialQuiz.getNextQuestion);
router.get('/courses/:course/quizzes/:tutorialQuiz/end', controllers.TutorialQuiz.endQuiz);

module.exports = router;