var _ = require('lodash'),
    passport = require('passport'),
    router = require('express').Router();
var upload = require('../lib/upload');
var controllers = require('../controllers');

// query single objects
router.param('us3r', controllers.User.getUser);
router.param('course', controllers.Course.getCourse);
router.param('tutorial', controllers.Tutorial.getTutorial);
router.param('quiz', controllers.Quiz.getQuiz);
router.param('question', controllers.Question.getQuestion);
router.param('fil3', controllers.File.getFile);
router.param('group', controllers.Group.getGroup);

// non-authenticated routes
router.get('/install', controllers.User.install);
router.get('/login', controllers.User.getLoginForm);
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin/courses',
    failureRedirect: '/admin/login',
    failureFlash: true
}));

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated() && req.user.hasAnyRole(['admin', 'instructor', 'teachingAssistant']))
        return next();
    req.logout();
    res.redirect('/admin/login');
});

// authenticated routes
router.get('/logout', controllers.User.logout);

router.get('/', controllers.Course.getCourseList);
router.get('/courses', controllers.Course.getCourseList);
router.get('/courses/new', controllers.Course.getCourseForm);
router.get('/courses/:course/edit', controllers.Course.getCourseForm);
router.post('/courses', controllers.Course.addCourse);
router.put('/courses/:course', controllers.Course.editCourse);
router.delete('/courses/:course', controllers.Course.deleteCourse);

router.get('/courses/:course/tutorials', controllers.Tutorial.getTutorialList);
router.post('/courses/:course/tutorials', controllers.Tutorial.addTutorialList);
router.get('/courses/:course/tutorials/:tutorial/edit', controllers.Tutorial.getTutorialForm);
router.put('/courses/:course/tutorials/:tutorial', controllers.Tutorial.editTutorial);
router.delete('/courses/:course/tutorials/:tutorial', controllers.Tutorial.deleteTutorial);

router.get('/courses/:course/tutorials/:tutorial/students', controllers.Student.getStudentsByTutorial);
router.get('/courses/:course/tutorials/:tutorial/students/:us3r/marks', controllers.Response.getMarkListByStudent);

router.get('/courses/:course/quizzes', controllers.Quiz.getQuizList);
router.get('/courses/:course/quizzes/new', controllers.Quiz.getQuizForm);
router.get('/courses/:course/quizzes/:quiz/edit', controllers.Quiz.getQuizForm);
router.post('/courses/:course/quizzes', controllers.Quiz.addQuiz);
router.post('/courses/:course/quizzes/:quiz/copy', controllers.Quiz.copyQuiz);
router.put('/courses/:course/quizzes/:quiz', controllers.Quiz.editQuiz);
router.delete('/courses/:course/quizzes/:quiz', controllers.Quiz.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', controllers.Question.getQuestionList);
router.put('/courses/:course/quizzes/:quiz/questions/sort', controllers.Question.sortQuestionList);
router.get('/courses/:course/quizzes/:quiz/questions/new', controllers.Question.getQuestionForm);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', controllers.Question.getQuestionForm);
router.post('/courses/:course/quizzes/:quiz/questions', controllers.Question.addQuestion);
router.post('/courses/:course/quizzes/:quiz/questions/preview', controllers.Question.previewQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.editQuestion);
router.delete('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.deleteQuestion);

router.get('/courses/:course/files', controllers.File.getFileList);
router.post('/courses/:course/files', upload.any.array('files'), controllers.File.addFiles);
router.delete('/courses/:course/files', controllers.File.deleteFiles);

// ugly routes begin here...
router.get('/courses/:course/conduct', controllers.TutorialQuiz.conductTutorialQuizList);
router.post('/courses/:course/conduct/marks', controllers.Response.getMarkListByCourse);
router.put('/courses/:course/conduct/edit', controllers.TutorialQuiz.editTutorialQuizListByCourse);
router.get('/courses/:course/tutorials/:tutorial/quizzes', controllers.TutorialQuiz.conductTutorialQuizList);
router.get('/courses/:course/tutorials/:tutorial/quizzes/:quiz/conduct', controllers.TutorialQuiz.conductTutorialQuiz);
router.put('/courses/:course/tutorials/:tutorial/quizzes/:quiz', controllers.TutorialQuiz.editTutorialQuiz);
router.get('/courses/:course/tutorials/:tutorial/quizzes/:quiz/marks', controllers.Response.getMarkListByTutorialQuiz);

router.get('/courses/:course/tutorials/:tutorial/quizzes/:quiz/groups/generate', controllers.Group.generateGroupList);
router.put('/courses/:course/tutorials/:tutorial/quizzes/:quiz/groups', controllers.Group.saveGroupList);
router.get('/courses/:course/tutorials/:tutorial/quizzes/:quiz/groups/:group/responses', controllers.Response.getResponseList);

router.get('/users', controllers.User.getUserList);
router.get('/users/new', controllers.User.getUserForm);
router.get('/users/:us3r/edit', controllers.User.getUserForm);
router.post('/users', controllers.User.addUser);
router.put('/users/:us3r', controllers.User.editUser);
router.delete('/users/:us3r', controllers.User.deleteUser);

router.get('/courses/:course/instructors', controllers.Instructor.getInstructorListByCourse);
router.get('/courses/:course/instructors/search', controllers.Instructor.getInstructorListBySearchQuery);
router.post('/courses/:course/instructors', controllers.Instructor.addInstructorList);
router.delete('/courses/:course/instructors/:us3r', controllers.Instructor.deleteInstructor);

router.get('/courses/:course/teaching-assistants', controllers.TeachingAssistant.getTeachingAssistantListByCourse);
router.get('/courses/:course/teaching-assistants/search', controllers.TeachingAssistant.getTeachingAssistantListBySearchQuery);
router.post('/courses/:course/teaching-assistants', controllers.TeachingAssistant.addTeachingAssistantList);
router.put('/courses/:course/teaching-assistants', controllers.TeachingAssistant.editTeachingAssistantList);
router.delete('/courses/:course/teaching-assistants', controllers.TeachingAssistant.deleteTeachingAssistantList);

router.get('/courses/:course/students', controllers.Student.getStudentListByCourse);
router.get('/courses/:course/students/search', controllers.Student.getStudentListBySearchQuery);
router.post('/courses/:course/students/import', upload.csv.single('file'), controllers.Student.importStudentList);
router.post('/courses/:course/students', controllers.Student.addStudentList);
router.put('/courses/:course/students', controllers.Student.editStudentList);
router.delete('/courses/:course/students', controllers.Student.deleteStudentList);

// for demo only
router.get('/resetdemo', controllers.TutorialQuiz.resetdemo);

module.exports = router;