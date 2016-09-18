var fs = require('fs');

var _ = require('lodash'),
    multer = require('multer'),
    passport = require('passport'),
    router = require('express').Router();

var controllers = require('../controllers');

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

var csvUpload = multer({ storage: multer.MemoryStorage });

// non-authenticated routes
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

// lifesaver: query single objects
router.param('us3r', controllers.User.getUser);
router.param('course', controllers.Course.getCourse);
router.param('tutorial', controllers.Tutorial.getTutorial);
router.param('quiz', controllers.Quiz.getQuiz);
router.param('question', controllers.Question.getQuestion);
router.param('fil3', controllers.File.getFile);
router.param('tutorialQuiz', controllers.TutorialQuiz.getQuiz);
router.param('group', controllers.Group.getGroup);

// check if user is authenticated
router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
});

// build breadcrumbs
// @TODO: find a way to add slugs in between keywords 
// e.g. Courses / Tutorials ----> Courses / CSCC09H3 / Tutorials
router.use(function (req, res, next) {
    if (!req.xhr && req.method === 'GET') {
        var keywords = [
            'users', 'students', 'teaching-assistants', 'instructors',
            'courses', 'tutorials', 'quizzes', 'questions', 'files', 
            'groups'
        ];
        var fragments = req.url.split('/');
        res.locals.breadcrumbs = [];
        fragments.forEach(function (fragment, f) {
            // check if fragment is one of the keywords
            if (keywords.indexOf(fragment) !== -1) {
                res.locals.breadcrumbs.push({
                    text: _.upperFirst(_.startCase(fragment)),
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

router.get('/logout', controllers.User.logout);

router.get('/courses', controllers.Course.getCourseList);
router.get('/courses/new', controllers.Course.getCourseForm);
router.get('/courses/:course/edit', controllers.Course.getCourseForm);
router.post('/courses', controllers.Course.addCourse);
router.put('/courses/:course', controllers.Course.editCourse);
//router.delete('/courses/:course', controllers.Course.deleteCourse);

router.get('/courses/:course/tutorials', controllers.Tutorial.getTutorialList);
router.get('/courses/:course/tutorials/new', controllers.Tutorial.getTutorialForm);
router.get('/courses/:course/tutorials/:tutorial/edit', controllers.Tutorial.getTutorialForm);
router.post('/courses/:course/tutorials', controllers.Tutorial.addTutorial);
router.put('/courses/:course/tutorials/:tutorial', controllers.Tutorial.editTutorial);
// router.delete('/courses/:course/tutorials/:tutorial', controllers.Tutorial.deleteTutorial);

router.get('/courses/:course/tutorials/:tutorial/students', controllers.Student.getStudentsByTutorial);
// router.post('/courses/:course/tutorials/:tutorial/students/:student', controllers.User.addStudentInTutorial);
// router.delete('/courses/:course/tutorials/:tutorial/students/:student', controllers.User.deleteStudentInTutorial);

router.get('/courses/:course/quizzes', controllers.Quiz.getQuizList);
router.get('/courses/:course/quizzes/new', controllers.Quiz.getQuizForm);
router.get('/courses/:course/quizzes/:quiz/edit', controllers.Quiz.getQuizForm);
router.post('/courses/:course/quizzes', controllers.Quiz.addQuiz);
router.put('/courses/:course/quizzes/:quiz', controllers.Quiz.editQuiz);
// //router.delete('/courses/:course/quizzes/:quiz', controllers.Quiz.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', controllers.Question.getQuestionList);
router.put('/courses/:course/quizzes/:quiz/questions/sort', controllers.Question.sortQuestionList);
router.get('/courses/:course/quizzes/:quiz/questions/new', controllers.Question.getQuestionForm);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', controllers.Question.getQuestionForm);
router.post('/courses/:course/quizzes/:quiz/questions', controllers.Question.addQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.editQuestion);
//router.delete('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.deleteQuestion);

router.get('/courses/:course/tutorials/:tutorial/quizzes', controllers.TutorialQuiz.getQuizListForAdmin);
router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/edit', controllers.TutorialQuiz.getQuizForm);
router.put('/courses/:course/tutorial-quizzes/:tutorialQuiz', controllers.TutorialQuiz.editQuiz);

router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups', controllers.Group.getGroupList);
router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/generate', controllers.Group.generateGroups);
//router.post('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/save', controllers.Group.saveGroups);
//router.get('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/:group/view', controllers.Group.viewGroupForm);
//router.delete('/courses/:course/tutorial-quizzes/:tutorialQuiz/groups/:group', controllers.Group.deleteGroupFromTutorial);

router.get('/courses/:course/files', controllers.File.getFileList);
router.get('/courses/:course/files/new', controllers.File.getFileForm);
router.get('/courses/:course/files/:fil3/edit', controllers.File.getFileForm);
router.post('/courses/:course/files', anyUpload.single('file'), controllers.File.addFile);
router.put('/courses/:course/files/:fil3', anyUpload.single('file'), controllers.File.editFile);
//router.delete('/courses/:course/files/:fil3', controllers.File.deleteFile);

router.get('/users', controllers.User.getUserList);
router.get('/users/new', controllers.User.getUserForm);
router.get('/users/:us3r/edit', controllers.User.getUserForm);
router.post('/users', controllers.User.addUser);
router.put('/users/:us3r', controllers.User.editUser);
//router.delete('/users/:user', controllers.User.deleteUser);

router.get('/courses/:course/instructors', controllers.Instructor.getInstructorListByCourse);
router.get('/courses/:course/instructors/search', controllers.Instructor.getInstructorListBySearchQuery);
router.post('/courses/:course/instructors/:us3r', controllers.Instructor.addInstructor);
router.delete('/courses/:course/instructors/:us3r', controllers.Instructor.deleteInstructor);

router.get('/courses/:course/teaching-assistants', controllers.TeachingAssistant.getTeachingAssistantListByCourse);
router.get('/courses/:course/teaching-assistants/search', controllers.TeachingAssistant.getTeachingAssistantListBySearchQuery);
router.post('/courses/:course/teaching-assistants/:us3r', controllers.TeachingAssistant.addTeachingAssistant);
router.put('/courses/:course/teaching-assistants/:us3r', controllers.TeachingAssistant.editTeachingAssistant);
router.delete('/courses/:course/teaching-assistants/:us3r', controllers.TeachingAssistant.deleteTeachingAssistant);

router.get('/courses/:course/students', controllers.Student.getStudentListByCourse);
router.get('/courses/:course/students/search', controllers.Student.getStudentListBySearchQuery);
router.post('/courses/:course/students/import', csvUpload.single('file'), controllers.Student.importStudents);
router.post('/courses/:course/students/:us3r', controllers.Student.addStudent);
router.put('/courses/:course/students/:us3r', controllers.Student.editStudent);
router.delete('/courses/:course/students/:us3r', controllers.Student.deleteStudent);

module.exports = router;