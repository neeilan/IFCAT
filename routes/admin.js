const _ = require('lodash'),
    controllers = require('../controllers/admin'),
    passport = require('passport'),
    upload = require('../utils/upload'),
    mongoose = require('mongoose');/*,
    logger = require('../utils/logger');*/

let router = require('express').Router();

// non-authenticated routes
router.get('/install', controllers.User.install);
router.get('/login', controllers.User.getLogin);
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin/courses',
    failureRedirect: '/admin/login',
    failureFlash: true
}));

// check if user is authenticated
router.use((req, res, next) => {
    if (req.isAuthenticated() && req.user.hasAnyRole(['admin', 'instructor', 'teachingAssistant']))
        return next();
    req.logout();
    res.redirect('/admin/login');
});

// query single objects
router.param('us3r', controllers.User.getUserByParam);
router.param('student', controllers.Student.getStudentByParam);
router.param('course', controllers.Course.getCourseByParam);
router.param('tutorial', controllers.Tutorial.getTutorialByParam);
router.param('quiz', controllers.Quiz.getQuizByParam);
router.param('tutorialQuiz', controllers.TutorialQuiz.getTutorialQuizByParam);
router.param('question', controllers.Question.getQuestionByParam);
router.param('fil3', controllers.File.getFileByParam);
router.param('group', controllers.Group.getGroupByParam);

// authenticated routes
router.get('/logout', controllers.User.logout);

router.get('/users', controllers.User.getUsers);
router.get('/users/new', controllers.User.getUser);
router.get('/users/:us3r/edit', controllers.User.getUser);
router.post('/users', controllers.User.addUser);
router.put('/users/:us3r', controllers.User.editUser);
router.delete('/users/:us3r', controllers.User.deleteUser);

router.get('/', controllers.Course.getCourses);
router.get('/courses', controllers.Course.getCourses);
router.get('/courses/new', controllers.Course.getCourse);
router.get('/courses/:course/edit', controllers.Course.getCourse);
router.post('/courses', controllers.Course.addCourse);
router.put('/courses/:course', controllers.Course.editCourse);
router.delete('/courses/:course', controllers.Course.deleteCourse);

router.get('/courses/:course/files', controllers.File.getFiles);
router.post('/courses/:course/files', upload.any.array('files'), controllers.File.addFiles);
router.delete('/courses/:course/files', controllers.File.deleteFiles);

router.get('/courses/:course/tutorials', controllers.Tutorial.getTutorials);
router.post('/courses/:course/tutorials', controllers.Tutorial.addTutorials);
router.get('/courses/:course/tutorials/:tutorial/edit', controllers.Tutorial.getTutorial);
router.put('/courses/:course/tutorials/:tutorial', controllers.Tutorial.editTutorial);
router.delete('/courses/:course/tutorials/:tutorial', controllers.Tutorial.deleteTutorial);

router.get('/courses/:course/tutorials/:tutorial/students', controllers.Student.getStudentsByTutorial);

router.get('/courses/:course/quizzes', controllers.Quiz.getQuizzes);
router.get('/courses/:course/quizzes/new', controllers.Quiz.getQuiz);
router.get('/courses/:course/quizzes/:quiz/edit', controllers.Quiz.getQuiz);
router.post('/courses/:course/quizzes', controllers.Quiz.addQuiz);
router.post('/courses/:course/quizzes/:quiz/copy', controllers.Quiz.copyQuiz);
router.put('/courses/:course/quizzes/:quiz', controllers.Quiz.editQuiz);
router.delete('/courses/:course/quizzes/:quiz', controllers.Quiz.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', controllers.Question.getQuestions);
router.put('/courses/:course/quizzes/:quiz/questions/sort', controllers.Question.sortQuestions);
router.get('/courses/:course/quizzes/:quiz/questions/new', controllers.Question.getQuestion);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', controllers.Question.getQuestion);
router.post('/courses/:course/quizzes/:quiz/questions', controllers.Question.addQuestion);
router.post('/courses/:course/quizzes/:quiz/questions/preview', controllers.Question.previewQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.editQuestion);
router.delete('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.deleteQuestion);

router.get('/courses/:course/instructors', controllers.Instructor.getInstructorsByCourse);
router.get('/courses/:course/instructors/search', controllers.Instructor.getInstructorsBySearchQuery);
router.post('/courses/:course/instructors', controllers.Instructor.addInstructors);
router.delete('/courses/:course/instructors', controllers.Instructor.deleteInstructors);

router.get('/courses/:course/teaching-assistants', controllers.TeachingAssistant.getTeachingAssistantsByCourse);
router.get('/courses/:course/teaching-assistants/search', controllers.TeachingAssistant.getTeachingAssistantsBySearchQuery);
router.post('/courses/:course/teaching-assistants', controllers.TeachingAssistant.addTeachingAssistants);
router.patch('/courses/:course/teaching-assistants', controllers.TeachingAssistant.editTeachingAssistants);
router.delete('/courses/:course/teaching-assistants', controllers.TeachingAssistant.deleteTeachingAssistants);

router.get('/courses/:course/students', controllers.Student.getStudentsByCourse);
router.get('/courses/:course/students/search', controllers.Student.getStudentsBySearchQuery);
router.post('/courses/:course/students/import', upload.csv.single('file'), controllers.Student.importStudents);
router.post('/courses/:course/students', controllers.Student.addStudents);
router.patch('/courses/:course/students', controllers.Student.editStudents);
router.delete('/courses/:course/students', controllers.Student.deleteStudents);

router.get('/courses/:course/tutorials-quizzes', controllers.TutorialQuiz.getTutorialQuizzes);
router.patch('/courses/:course/tutorials-quizzes', controllers.TutorialQuiz.editTutorialQuizzes);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz', controllers.TutorialQuiz.getTutorialQuiz);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz/settings', controllers.TutorialQuiz.editTutorialQuizSettings);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups', controllers.Group.saveGroups);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/generate', controllers.Group.generateGroups);

router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses', controllers.Response.getResponses);
router.post('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses', controllers.Response.addResponse);
router.put('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses/:response', controllers.Response.editResponse);

router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/marks', controllers.Response.getMarksByTutorialQuiz);

// ugly routes begin here...

router.post('/courses/:course/marks', controllers.Response.getMarksByCourse);
router.get('/courses/:course/students/:student/marks', controllers.Response.getMarksByStudent);

// router.use((err, req, res, next) => {
//     // ignore validation errors
//     if (err instanceof mongoose.Error.ValidationError) {
//         req.flash('error', 'An error occurred while trying to perform operation.');
//         return res.redirect('back');
//     }
//     // @todo: include more info
//     logger.error('%s', err.message);
//     // handle AJAX request with 'Bad Request'
//     if (req.xhr) {
//         return res.status(400).send('An error occurred while trying to perform operation.');
//     }
//     next(err);
// });

module.exports = router;