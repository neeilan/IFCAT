var router = require('express').Router();
var authenticate = require('../middlewares/authenticate');
var QuizController = require('../controllers/quiz-controller');

module.exports = function (app, passport, acl) {

    router.get('/quizzes', [authenticate, acl.middleware()], QuizController.getQuizzes);
    router.get('/quizzes/:id', [authenticate, acl.middleware()], QuizController.getQuiz);
    router.post('/quizzes/:id', [authenticate, acl.middleware()], QuizController.addQuiz);
    router.put('/quizzes/:id', [authenticate, acl.middleware()], QuizController.editQuiz);
    router.delete('/quizzes/:id', [authenticate, acl.middleware()], QuizController.deleteQuiz);

    app.use('/admin', router);
};