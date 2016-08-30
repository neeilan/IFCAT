var passport = require('passport'),
    router = require('express').Router();

// controllers
var CourseController = require('../controllers/course'),
    TutorialController = require('../controllers/tutorial'),
    QuizController = require('../controllers/quiz'),
    QuestionController = require('../controllers/question'),
    FileController = require('../controllers/file'),
    TutorialQuizController = require('../controllers/tutorialQuiz'),
    GroupController = require('../controllers/group'),
    UserController = require('../controllers/user'),
    StudentController = require('../controllers/student');

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
router.param('course', CourseController.getCourse);
router.param('tutorial', TutorialController.getTutorial);
router.param('group', GroupController.getGroup);
router.param('quiz', QuizController.getQuiz);
router.param('question', QuestionController.getQuestion);
router.param('fil3', FileController.getFile);
router.param('tutorialQuiz', TutorialQuizController.getQuiz);

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
});

// authenticated routes
router.get('/logout', UserController.logout);

router.get('/courses', CourseController.getCourseListForStudent);
router.get('/courses/:course/quizzes', TutorialQuizController.getQuizListForStudent);
router.get('/courses/:course/quizzes/:tutorialQuiz/start', TutorialQuizController.startQuiz);
router.get('/courses/:course/quizzes/:tutorialQuiz/questions/:question', TutorialQuizController.getNextQuestion);
router.get('/courses/:course/quizzes/:tutorialQuiz/end', TutorialQuizController.endQuiz);

module.exports = router;