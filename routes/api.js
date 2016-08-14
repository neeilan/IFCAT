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
    router.get('/courses/:course', CourseController.getCourse);
    router.post('/courses', CourseController.addCourse);
    router.put('/courses/:course', CourseController.editCourse);
    router.delete('/courses/:course', CourseController.deleteCourse);

    /*router.get('/courses/:course/students', UserController.getStudentsByCourse);
    router.post('/courses/:course/students/import', UserController.importStudents);
    
    router.get('/courses/:course/tutorials', TutorialController.getTutorials);
    router.get('/courses/:course/tutorials/:tutorial', TutorialController.getTutorial);
    router.post('/courses/:course/tutorials', TutorialController.addTutorial);
    router.put('/courses/:course/tutorials/:tutorial', TutorialController.editTutorial);
    router.delete('/courses/:course/tutorials/:tutorial', TutorialController.deleteTutorial);
    
    router.get('/courses/:course/tutorials/:tutorial/students', UserController.getStudentsByTutorial);
    router.post('/courses/:course/tutorials/:tutorial/students/:student', UserController.addStudentInTutorial);
    router.delete('/courses/:course/tutorials/:tutorial/students/:student', UserController.deleteStudentInTutorial);

    router.get('/courses/:course/tutorials/:tutorial/groups', GroupController.getGroups);
    router.get('/courses/:course/tutorials/:tutorial/groups/:group', GroupController.getGroup);
    router.post('/courses/:course/tutorials/:tutorial/groups', GroupController.addGroup);
    router.delete('/courses/:course/tutorials/:tutorial/groups/:group', GroupController.deleteGroup);

    router.get('/courses/:course/quizzes', QuizController.getQuizzes);
    router.get('/courses/:course/quizzes/:quiz', QuizController.getQuiz);
    router.post('/courses/:course/quizzes', QuizController.addQuiz);
    router.put('/courses/:course/quizzes/:quiz', QuizController.editQuiz);
    router.delete('/courses/:course/quizzes/:quiz', QuizController.deleteQuiz);

    router.get('/courses/:course/quizzes/:quiz/questions', QuestionController.getQuestions);
    router.get('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.getQuestion);
    router.post('/courses/:course/quizzes/:quiz/questions', QuestionController.addQuestion);
    router.put('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.editQuestion);
    router.delete('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.deleteQuestion);

    router.get('/files', UserController.getFiles);
    router.post('/files', UserController.addFiles);
    router.delete('/files', UserController.deleteFiles);
    router.get('/files/:file', UserController.getFile);
    router.put('/files/:file', UserController.editFile);*/

    app.use('/api', [authenticate, acl.middleware()], router);
};