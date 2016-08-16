var path = require('path');

var router = require('express').Router();

// controllers
var UserController = require('../controllers/user-controller')/*,
    CourseController = require('../controllers/course-controller'),
    //TutorialController = require('../controllers/tutorial-controller'),
    //GroupController = require('../controllers/group-controller'),
    //QuizController = require('../controllers/quiz-controller')/*,
    QuestionController = require('../controllers/question-controller')*/;

// routes
module.exports = function (app, passport, acl) {

    router.get('/login', UserController.getLogin);
    //router.post('/login', UserController.login);

    router.post('/logout', UserController.logout);

    app.use(/*[authenticate, acl.middleware()],*/ router);
};