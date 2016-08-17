var router = require('express').Router(),
    upload = require('multer')();

// controllers
var UserController = require('../controllers/user-controller'),
    CourseController = require('../controllers/course-controller'),
    TutorialController = require('../controllers/tutorial-controller')/*,
    GroupController = require('../controllers/group-controller'),
    QuizController = require('../controllers/quiz-controller'),
    QuestionController = require('../controllers/question-controller')*/;

// routes
module.exports = function (app, passport, acl) {

    router.post('/login', passport.authenticate('local', { successRedirect: '/admin/courses', failureRedirect: '/login' }));

    router.get('/courses', CourseController.getCoursesByAdmin);
    router.get('/courses/new', CourseController.getNewCourseForm);
    router.get('/courses/:course/edit', CourseController.getCourseForm);
    router.post('/courses', CourseController.addCourse);
    router.put('/courses/:course', CourseController.editCourse);
    router.delete('/courses/:course', CourseController.deleteCourse);

    //router.get('/courses/:course/students', UserController.getStudentsByCourse);
    // router.post('/courses/:course/students/import', upload.single('file'), UserController.importStudents);
    
    router.get('/courses/:course/tutorials', TutorialController.getTutorialsByAdmin);
    router.get('/courses/:course/tutorials/new', TutorialController.getNewTutorialForm);
    router.get('/courses/:course/tutorials/:tutorial/edit', TutorialController.getTutorialForm);
    router.post('/courses/:course/tutorials', TutorialController.addTutorial);
    router.put('/courses/:course/tutorials/:tutorial', TutorialController.editTutorial);
    // router.delete('/courses/:course/tutorials/:tutorial', TutorialController.deleteTutorial);
    
    // /*router.get('/courses/:course/tutorials/:tutorial/students', UserController.getStudentsByTutorial);
    // router.post('/courses/:course/tutorials/:tutorial/students/:student', UserController.addStudentInTutorial);
    // router.delete('/courses/:course/tutorials/:tutorial/students/:student', UserController.deleteStudentInTutorial);*/

    // router.get('/courses/:course/tutorials/:tutorial/groups', GroupController.getGroupsByTutorial);
    // //router.get('/courses/:course/tutorials/:tutorial/groups/new', GroupController.getNewGroupForm);
    // //router.get('/courses/:course/tutorials/:tutorial/groups/:group/edit', GroupController.getGroupForm);
    // router.post('/courses/:course/tutorials/:tutorial/groups', GroupController.addGroupToTutorial);
    // router.delete('/courses/:course/tutorials/:tutorial/groups/:group', GroupController.deleteGroupFromTutorial);

    // router.get('/courses/:course/quizzes', QuizController.getQuizzesByCourse);
    // //router.get('/courses/:course/quizzes/new', QuizController.getQuizzesByCourse);
    // //router.get('/courses/:course/quizzes/:quiz/edit', QuizController.getQuiz);
    // router.post('/courses/:course/quizzes', QuizController.addQuizToCourse);
    // router.post('/courses/:course/tutorials/:tutorial/quizzes/:quiz', QuizController.addQuizToTutorial);
    // router.put('/courses/:course/quizzes/:quiz', QuizController.editQuiz);
    // router.delete('/courses/:course/quizzes/:quiz', QuizController.deleteQuizFromCourse);
    // router.delete('/courses/:course/tutorials/:tutorial/quizzes/:quiz', QuizController.deleteQuizFromTutorial);

    /*router.get('/courses/:course/quizzes/:quiz/questions', QuestionController.getQuestions);
    router.get('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.getQuestion);
    router.post('/courses/:course/quizzes/:quiz/questions', QuestionController.addQuestion);
    router.put('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.editQuestion);
    router.delete('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.deleteQuestion);

    router.get('/files', UserController.getFiles);
    router.post('/files', UserController.addFiles);
    router.delete('/files', UserController.deleteFiles);
    router.get('/files/:file', UserController.getFile);
    router.put('/files/:file', UserController.editFile);*/

    app.use('/admin', /*[authenticate, acl.middleware()],*/ router);
};