var router = require('express').Router();
var authenticate = require('../middlewares/authenticate');

// controllers
var UserController = require('../controllers/user-controller'),
    CourseController = require('../controllers/course-controller')/*,
    TutorialController = require('../controllers/tutorial-controller'),
    GroupController = require('../controllers/group-controller'),
    QuizController = require('../controllers/quiz-controller'),
    QuestionController = require('../controllers/question-controller')*/;

// routes
module.exports = function (app, passport, acl) {

    router.post('/api/register', passport.authenticate('local-register', { successRedirect : '/', failureRedirect : '/api/login' }));
    router.post('/api/login', UserController.login);
    router.post('/api/logout', UserController.logout);

    router.get('/courses', CourseController.getCourses);
    router.get('/courses/:id', CourseController.getCourse);
    router.post('/courses/:id', CourseController.addCourse);
    router.put('/courses/:id', CourseController.editCourse);
    router.delete('/courses/:id', CourseController.deleteCourse);

    /*router.get('/courses/:courseId/students', UserController.getStudentsByCourse);
    router.post('/courses/:courseId/students/import', UserController.importStudents);
    
    router.get('/courses/:courseId/tutorials', TutorialController.getTutorials);
    router.get('/courses/:courseId/tutorials/:id', TutorialController.getTutorial);
    router.post('/courses/:courseId/tutorials/:id', TutorialController.addTutorial);
    router.put('/courses/:courseId/tutorials/:id', TutorialController.editTutorial);
    router.delete('/courses/:courseId/tutorials/:id', TutorialController.deleteTutorial);
    
    router.get('/courses/:courseId/tutorials/:tutorialId/students', UserController.getStudentsByTutorial);
    router.post('/courses/:courseId/tutorials/:tutorialId/students/:id', UserController.addStudentInTutorial);
    router.delete('/courses/:courseId/tutorials/:tutorialId/students/:id', UserController.deleteStudentInTutorial);

    router.get('/courses/:courseId/tutorials/:tutorialId/groups', GroupController.getGroups);
    router.get('/courses/:courseId/tutorials/:tutorialId/groups/:id', GroupController.getGroup);
    router.post('/courses/:courseId/tutorials/:tutorialId/groups', GroupController.addGroup);
    router.delete('/courses/:courseId/tutorials/:tutorialId/groups/:id', GroupController.deleteGroup);

    router.get('/courses/:courseId/quizzes', QuizController.getQuizzes);
    router.get('/courses/:courseId/quizzes/:id', QuizController.getQuiz);
    router.post('/courses/:courseId/quizzes/:id', QuizController.addQuiz);
    router.put('/courses/:courseId/quizzes/:id', QuizController.editQuiz);
    router.delete('/courses/:courseId/quizzes/:id', QuizController.deleteQuiz);

    router.get('/courses/:courseId/quizzes/:quizId/questions', QuestionController.getQuestions);
    router.get('/courses/:courseId/quizzes/:quizId/questions/:id', QuestionController.getQuestion);
    router.post('/courses/:courseId/quizzes/:quizId/questions/:id', QuestionController.addQuestion);
    router.put('/courses/:courseId/quizzes/:quizId/questions/:id', QuestionController.editQuestion);
    router.delete('/courses/:courseId/quizzes/:quizId/questions/:id', QuestionController.deleteQuestion);

    router.get('/files', UserController.getFiles);
    router.post('/files', UserController.addFiles);
    router.delete('/files', UserController.deleteFiles);
    router.get('/files/:id', UserController.getFile);
    router.put('/files/:id', UserController.editFile);*/

    app.use('/api', [authenticate, acl.middleware()], router);
};