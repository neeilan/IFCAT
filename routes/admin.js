var _ = require('lodash'),
    passport = require('passport'),
    router = require('express').Router();

var breadcrumbs = require('../lib/breadcrumbs'),
    upload = require('../lib/upload');
    
var controllers = require('../controllers');

// query single objects
router.param('us3r', controllers.User.getUser);
router.param('course', controllers.Course.getCourse);
router.param('tutorial', controllers.Tutorial.getTutorial);
router.param('quiz', controllers.Quiz.getQuiz);
router.param('question', controllers.Question.getQuestion);
router.param('fil3', controllers.File.getFile);
router.param('tutorialQuiz', controllers.TutorialQuiz.getQuiz);
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
    if (req.isAuthenticated())
        return next();
    res.redirect('/admin/login');
});

// build breadcrumbs
router.use(breadcrumbs);

// authenticated routes
router.get('/logout', controllers.User.logout);
router.get('/help', controllers.User.getHelp);

//router.get('/courses/generate', controllers.Course.generateData);

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

router.get('/courses/:course/quizzes', controllers.Quiz.getQuizList);
router.get('/courses/:course/quizzes/new', controllers.Quiz.getQuizForm);
router.get('/courses/:course/quizzes/:quiz/edit', controllers.Quiz.getQuizForm);
router.post('/courses/:course/quizzes', controllers.Quiz.addQuiz);
router.put('/courses/:course/quizzes/:quiz', controllers.Quiz.editQuiz);
router.delete('/courses/:course/quizzes/:quiz', controllers.Quiz.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', controllers.Question.getQuestionList);
router.put('/courses/:course/quizzes/:quiz/questions/sort', controllers.Question.sortQuestionList);
router.get('/courses/:course/quizzes/:quiz/questions/new', controllers.Question.getQuestionForm);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', controllers.Question.getQuestionForm);
router.post('/courses/:course/quizzes/:quiz/questions', controllers.Question.addQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.editQuestion);
router.delete('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.deleteQuestion);

router.get('/courses/:course/tutorials/:tutorial/quizzes', controllers.TutorialQuiz.getQuizListForAdmin);
router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/edit', controllers.TutorialQuiz.getQuizForm);
router.put('/courses/:course/tutorial-quizzes/:tutorialQuiz', controllers.TutorialQuiz.editQuiz);
router.put('/courses/:course/tutorial-quizzes/:tutorialQuiz/publish', controllers.TutorialQuiz.publishQuiz);
router.put('/courses/:course/tutorial-quizzes/:tutorialQuiz/activate', controllers.TutorialQuiz.activateQuiz);
router.put('/courses/:course/tutorial-quizzes/:tutorialQuiz/archive', controllers.TutorialQuiz.archiveQuiz);

router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups', controllers.Group.getGroupList);
router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/generate', controllers.Group.generateGroupList);
router.put('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups', controllers.Group.saveGroupList);

router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/:group/responses', controllers.Response.getResponseList);
router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/:group/responses/export', controllers.Response.exportResponseList);

router.get('/courses/:course/files', controllers.File.getFileList);
router.post('/courses/:course/files', upload.any.array('files'), controllers.File.addFiles);
router.delete('/courses/:course/files', controllers.File.deleteFiles);

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
router.delete('/courses/:course/teaching-assistants/:us3r', controllers.TeachingAssistant.deleteTeachingAssistant);

router.get('/courses/:course/students', controllers.Student.getStudentListByCourse);
router.get('/courses/:course/students/search', controllers.Student.getStudentListBySearchQuery);
router.post('/courses/:course/students/import', upload.csv.single('file'), controllers.Student.importStudentList);
router.post('/courses/:course/students', controllers.Student.addStudentList);
router.put('/courses/:course/students', controllers.Student.editStudentList);
router.delete('/courses/:course/students/:us3r', controllers.Student.deleteStudent);

router.get('/courses/:course/tutorials/:tutorial/students/:us3r/marks', controllers.Response.getMarks);

module.exports = router;