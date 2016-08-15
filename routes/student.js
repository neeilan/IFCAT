var router = require('express').Router(),
    upload = require('multer')();

// controllers
var UserController = require('../controllers/user-controller'),
    CourseController = require('../controllers/course-controller'),
    TutorialController = require('../controllers/tutorial-controller'),
    //GroupController = require('../controllers/group-controller'),
    QuizController = require('../controllers/quiz-controller')/*,
    QuestionController = require('../controllers/question-controller')*/;

// routes
module.exports = function (app, passport, acl) {


    app.use('/api', /*[authenticate, acl.middleware()],*/ router);
};