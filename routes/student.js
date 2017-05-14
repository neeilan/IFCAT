var passport = require('passport'),
    router = require('express').Router(),
    models = require('../models');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var controllers = require('../controllers');

router.param('course', controllers.Course.getCourseByParam);
router.param('tutorial', controllers.Tutorial.getTutorialByParam);
router.param('group', controllers.Group.getGroupByParam);
router.param('quiz', controllers.Quiz.getQuizByParam);
router.param('question', controllers.Question.getQuestionByParam);
router.param('fil3', controllers.File.getFileByParam);
router.param('tutorialQuiz', controllers.TutorialQuiz.getQuizByParam);

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/uteach-login', passport.authenticate('auth0', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true    
}), function(req,res) {
    res.redirect('/student/courses');
});

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
});

// authenticated routes
router.get('/logout', controllers.User.logout);
router.get('/courses', controllers.Student.getCourses);
router.get('/courses/:course/quizzes', controllers.Student.getQuizzes);
router.get('/courses/:course/quizzes/:tutorialQuiz/start', controllers.TutorialQuiz.startQuiz);
router.get('/file/:id', controllers.File.getFileLinkById);

module.exports = router;