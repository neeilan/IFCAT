var router = require('express').Router();

var upload = require('../config/multer');

// controllers
var AdminController = require('../controllers/admin'),
    CourseController = require('../controllers/course'),
    TutorialController = require('../controllers/tutorial'),
    //GroupController = require('../controllers/group'),
    QuizController = require('../controllers/quiz'),
    QuestionController = require('../controllers/question'),
    FileController = require('../controllers/file');

// routes
router.post('/login', AdminController.login);


router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
});

router.get('/courses', CourseController.getCourses);
router.get('/courses/new', CourseController.getNewCourseForm);
router.get('/courses/:course/edit', CourseController.getCourseForm);
router.post('/courses', CourseController.addCourse);
router.put('/courses/:course', CourseController.editCourse);
router.delete('/courses/:course', CourseController.deleteCourse);

//router.get('/courses/:course/students', UserController.getStudentsByCourse);
//router.post('/courses/:course/students/import', upload.single('file'), UserController.importStudents);

router.get('/courses/:course/tutorials', TutorialController.getTutorials);
router.get('/courses/:course/tutorials/new', TutorialController.getNewTutorialForm);
router.get('/courses/:course/tutorials/:tutorial/edit', TutorialController.getTutorialForm);
router.post('/courses/:course/tutorials', TutorialController.addTutorial);
router.put('/courses/:course/tutorials/:tutorial', TutorialController.editTutorial);
// router.delete('/courses/:course/tutorials/:tutorial', TutorialController.deleteTutorial);

// /*router.get('/courses/:course/tutorials/:tutorial/students', UserController.getStudentsByTutorial);
// router.post('/courses/:course/tutorials/:tutorial/students/:student', UserController.addStudentInTutorial);
// router.delete('/courses/:course/tutorials/:tutorial/students/:student', UserController.deleteStudentInTutorial);*/

/*router.get('/courses/:course/tutorials/:tutorial/groups', GroupController.getGroupsByTutorial);
router.get('/courses/:course/tutorials/:tutorial/groups/new', GroupController.getNewGroupForm);
router.get('/courses/:course/tutorials/:tutorial/groups/:group/edit', GroupController.getGroupForm);
router.post('/courses/:course/tutorials/:tutorial/groups', GroupController.addGroupToTutorial);
router.delete('/courses/:course/tutorials/:tutorial/groups/:group', GroupController.deleteGroupFromTutorial);*/

router.get('/courses/:course/quizzes', QuizController.getQuizzesByCourse);
router.get('/courses/:course/quizzes/new', QuizController.getNewQuizForm);
router.get('/courses/:course/quizzes/:quiz/edit', QuizController.getQuizForm);
router.post('/courses/:course/quizzes', QuizController.addQuizToCourse);
router.put('/courses/:course/quizzes/:quiz', QuizController.editQuiz);
//router.delete('/courses/:course/quizzes/:quiz', QuizController.deleteQuizFromCourse);

// //router.post('/courses/:course/tutorials/:tutorial/quizzes/:quiz', QuizController.addQuizToTutorial);
// // router.delete('/courses/:course/tutorials/:tutorial/quizzes/:quiz', QuizController.deleteQuizFromTutorial);

router.get('/courses/:course/quizzes/:quiz/questions', QuestionController.getQuestions);
router.get('/courses/:course/quizzes/:quiz/questions/new', QuestionController.getNewQuestionForm);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', QuestionController.getQuestionForm);
router.post('/courses/:course/quizzes/:quiz/questions', QuestionController.addQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.editQuestion);
//router.delete('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.deleteQuestion);

router.get('/courses/:course/files', FileController.getFilesByCourse);
router.get('/courses/:course/files/new', FileController.getNewFileForm);
router.get('/courses/:course/files/:file/edit', FileController.getFileForm);
router.post('/courses/:course/files', upload.single('file'), FileController.addFile);
router.put('/courses/:course/files/:file', upload.single('file'), FileController.editFile);
//router.delete('/courses/:course/files/:file', FileController.deleteFile);

module.exports = router;