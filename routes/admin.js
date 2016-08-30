var fs = require('fs');

var multer = require('multer'),
    passport = require('passport'),
    router = require('express').Router(),
    _ = require('lodash');

// controllers
var CourseController = require('../controllers/course'),
    TutorialController = require('../controllers/tutorial'),
    QuizController = require('../controllers/quiz'),
    QuestionController = require('../controllers/question'),
    FileController = require('../controllers/file'),
    TutorialQuizController = require('../controllers/tutorialQuiz'),
    GroupController = require('../controllers/group'),
    UserController = require('../controllers/user'),
    StudentController = require('../controllers/student');

// upload configurations
var anyUpload = multer({ 
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            var dest = __dirname + '/../public/upl/' + req.params.course;
            // create course directory if it does not already exist
            fs.mkdir(dest, function (e) {
                if (e && e.code !== 'EEXIST') {
                    console.log(e);
                } else {
                    cb(null, dest);  
                }
            });
        },
        filename: function (req, file, cb) {
            // @TODO: handle duplicates e.g. 2nd file with name.ext should be renamed to name_2.ext
            cb(null, file.originalname);
        }
    })
});

var csvUpload = multer({ 
    storage: multer.MemoryStorage 
});

// non-authenticated routes
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

// lifesaver: query single objects
router.param('course', CourseController.getCourse);
router.param('tutorial', TutorialController.getTutorial);
router.param('group', GroupController.getGroup);
router.param('quiz', QuizController.getQuiz);
router.param('question', QuestionController.getQuestion);
router.param('fil3', FileController.getFile);
router.param('tutorialQuiz', TutorialQuizController.getQuiz);

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        console.log('authenticated');
        return next();
    }
    res.redirect('/login');
});

// build breadcrumbs
// @TODO: find a way to add slugs in between keywords 
// e.g. Courses / Tutorials ----> Courses / CSCC09H3 / Tutorials
router.use(function (req, res, next) {
    if (req.method === 'GET') {
        var keywords = ['courses', 'tutorials', 'quizzes', 'questions', 'files', 'students', 'groups'];
        var fragments = req.url.split('/');
        // look for keywords
        res.locals.breadcrumbs = [];
        fragments.forEach(function (fragment, f) {
            if (keywords.indexOf(fragment) !== -1) {
                res.locals.breadcrumbs.push({
                    text: _.upperFirst(fragment),
                    href: _.take(fragments, f + 1).join('/') 
                });
            }
        });
    }
    next();
});

// authenticated routes
// @TODO: handle delete routes e.g. deleting course = deleting every related to the course
// @TODO: handle unexpected errors
// @TODO: model validation
router.get('/logout', UserController.logout);

router.get('/courses', CourseController.getCourseListForAdmin);
router.get('/courses/new', CourseController.getCourseForm);
router.get('/courses/:course/edit', CourseController.getCourseForm);
router.post('/courses', CourseController.addCourse);
router.put('/courses/:course', CourseController.editCourse);
//router.delete('/courses/:course', CourseController.deleteCourse);

router.get('/courses/:course/students', StudentController.getStudentsByCourse);
//router.post('/courses/:course/students/import', csvUpload.single('file'), StudentController.importStudents);

router.get('/courses/:course/tutorials', TutorialController.getTutorialList);
router.get('/courses/:course/tutorials/new', TutorialController.getTutorialForm);
router.get('/courses/:course/tutorials/:tutorial/edit', TutorialController.getTutorialForm);
router.post('/courses/:course/tutorials', TutorialController.addTutorial);
router.put('/courses/:course/tutorials/:tutorial', TutorialController.editTutorial);
// router.delete('/courses/:course/tutorials/:tutorial', TutorialController.deleteTutorial);

// // /*router.get('/courses/:course/tutorials/:tutorial/students', UserController.getStudentsByTutorial);
// // router.post('/courses/:course/tutorials/:tutorial/students/:student', UserController.addStudentInTutorial);
// // router.delete('/courses/:course/tutorials/:tutorial/students/:student', UserController.deleteStudentInTutorial);*/

router.get('/courses/:course/quizzes', QuizController.getQuizList);
router.get('/courses/:course/quizzes/new', QuizController.getQuizForm);
router.get('/courses/:course/quizzes/:quiz/edit', QuizController.getQuizForm);
router.post('/courses/:course/quizzes', QuizController.addQuiz);
router.put('/courses/:course/quizzes/:quiz', QuizController.editQuiz);
// //router.delete('/courses/:course/quizzes/:quiz', QuizController.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', QuestionController.getQuestionList);
router.get('/courses/:course/quizzes/:quiz/questions/new', QuestionController.getQuestionForm);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', QuestionController.getQuestionForm);
router.post('/courses/:course/quizzes/:quiz/questions', QuestionController.addQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.editQuestion);
//router.delete('/courses/:course/quizzes/:quiz/questions/:question', QuestionController.deleteQuestion);

router.get('/courses/:course/tutorials/:tutorial/quizzes', TutorialQuizController.getQuizListForAdmin);
router.get('/courses/:course/tutorials/:tutorial/quizzes/new', TutorialQuizController.getQuizForm);
router.get('/courses/:course/tutorials/:tutorial/quizzes/:tutorialQuiz/edit', TutorialQuizController.getQuizForm);
router.post('/courses/:course/tutorials/:tutorial/quizzes', TutorialQuizController.addQuiz);
router.put('/courses/:course/tutorials/:tutorial/quizzes/:tutorialQuiz', TutorialQuizController.editQuiz);
// router.delete('/courses/:course/tutorials/:tutorial/quizzes/:quiz', QuizController.deleteQuiz);

router.get('/courses/:course/tutorials/:tutorial/quizzes/:tutorialQuiz/groups', GroupController.getGroupList);
router.post('/courses/:course/tutorials/:tutorial/quizzes/:tutorialQuiz/groups/generate', GroupController.generateGroups);
//router.get('/courses/:course/tutorials/:tutorial/quizzes/:tutorialQuiz/groups/new', GroupController.getGroupForm);
//router.get('/courses/:course/tutorials/:tutorial/quizzes/:tutorialQuiz/groups/:group/view', GroupController.viewGroupForm);
// router.delete('/courses/:course/tutorials/:tutorial/groups/:group', GroupController.deleteGroupFromTutorial);*/

router.get('/courses/:course/files', FileController.getFileList);
router.get('/courses/:course/files/new', FileController.getFileForm);
router.get('/courses/:course/files/:fil3/edit', FileController.getFileForm);
router.post('/courses/:course/files', anyUpload.single('file'), FileController.addFile);
router.put('/courses/:course/files/:fil3', anyUpload.single('file'), FileController.editFile);
//router.delete('/courses/:course/files/:fil3', FileController.deleteFile);

module.exports = router;