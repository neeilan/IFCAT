var passport = require('passport'),
    router = require('express').Router(),
    models = require('../models');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();


var controllers = require('../controllers');

// lifesaver: query single objects
router.param('course', controllers.Course.getCourse);
router.param('tutorial', controllers.Tutorial.getTutorial);
router.param('group', controllers.Group.getGroup);
router.param('quiz', controllers.Quiz.getQuiz);
router.param('question', controllers.Question.getQuestion);
router.param('fil3', controllers.File.getFile);
router.param('tutorialQuiz', controllers.TutorialQuiz.getQuiz);

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/uteach-login', passport.authenticate('auth0', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true    
}), function(req,res){
    res.redirect('/student/courses');
});

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
});

// authenticated routes
router.get('/logout', controllers.User.logout);

router.get('/courses', controllers.Student.getCourseList);
router.get('/courses/:course/quizzes', controllers.Student.getQuizList);
router.get('/courses/:course/quizzes/:tutorialQuiz/start', controllers.TutorialQuiz.startQuiz);


router.get('/file/:id', controllers.File.getFileLinkById);
module.exports = router;