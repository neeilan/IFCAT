var _ = require('lodash');

var models = require('../models');

// Retrieve course
exports.getQuiz = function (req, res, next, tutorial, quiz) {
    console.log('tq', tutorial, quiz);
    /*models.TutorialQuiz.findById(tutorialQuiz).populate('tutorial quiz').exec(function (err, tutorialQuiz) {
        if (err) {
            return next(err);
        }
        if (!tutorialQuiz) {
            return next(new Error('No tutorial quiz is found.'));
        }
        console.log('got tutorial quiz');
        req.tutorialQuiz = tutorialQuiz;
        next();
    });*/
};

// Retrieve quizzes within tutorial
exports.getQuizListForAdmin = function (req, res) {
    models.TutorialQuiz.find({
        path: 'tutorial',
        match: { 
            tutorial: req.tutorial.id 
        }
    }).populate('quiz').exec(function (err, tutorialQuizzes) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }*/
        res.render('admin/tutorial-quizzes', { 
            course: req.course, 
            tutorial: req.tutorial,
            tutorialQuizzes: tutorialQuizzes 
        });
    });
};

// Retrieve quizzes within course
exports.getQuizListForStudent = function (req, res) { 
    models.Course.populate(req.course, {
        // find the tutorial that student is in
        path: 'tutorials',
        model: models.Tutorial,
        match: {
            students: { $in: [req.user.id] }
        },
        // find the quizzes within the tutorial
        populate: {
            path: 'quizzes',
            model: models.TutorialQuiz,
            match: { published: true },
            populate: {
                path: 'quiz',
                model: models.Quiz
            }
        }
    }, function (err) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }*/
        var tutorial = req.course.tutorials[0];
        if (tutorial) {
            res.render('student/tutorial-quizzes', { course: req.course, tutorial: tutorial });
        } else {
            res.redirect('/student/courses');
        }
    });
};

// Retrieve quiz form
exports.getQuizForm = function (req, res) {
    models.Course.populate(req.course, { path: 'quizzes', sort: { name: 1 } }, function () {
        res.render('admin/tutorial-quiz', { 
            course: req.course, 
            tutorial: req.tutorial,
            tutorialQuiz: req.tutorialQuiz || new models.TutorialQuiz() 
        });
    });
};

// Add quiz to tutorial
exports.addQuiz = function (req, res) {
    var tutorialQuiz = new models.TutorialQuiz({ tutorial: req.tutorial });
        
    models.TutorialQuiz.create(req.body, function (err, tutorialQuiz) {
        
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorials/' + req.tutorial.id + 
            '/quizzes'
        );
        
    });
};

// Add quiz to tutorial
exports.editQuiz = function (req, res) {
    _.extend(req.tutorialQuiz, req.body).save(function (err) {
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorials/' + req.tutorial.id + 
            '/quizzes/' + req.tutorialmodels.Quiz.id +
            '/edit'
        );
    });
};

// Delete quiz from tutorial
exports.deleteQuiz = function (req, res) {

};

//
exports.startQuiz = function (req, res) {
    models.TutorialQuiz.populate(req.tutorialQuiz, {
        // get group with user as a member
        path: 'groups',
        model: models.Group,
        match: {
            members: { $in: [req.user.id] }
        },
        // get driver of the group
        populate: {
            path: 'driver'
        }
    }, function (err) {
        var group = req.tutorialQuiz.groups[0];
        // check if user belongs to a group
        if (!group) {
            return res.redirect('/admin/courses');
        }

        //console.log(req.tutorialQuiz);

        res.render('student/start-quiz', {
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            quiz: req.tutorialQuiz.quiz
        });
    });
};

exports.getNextQuestion = function (req, res) {
    /*async.series([
        function (cb) {
            models.Course.findById(req.params.course, cb);
        },
        function (cb) {
            models.Quiz.findById(req.params.quiz, cb);
        },
        function (cb) {
            models.models.Question.findById(req.params.question).populate('files').exec(cb);
        }
    ], 
    function (err, results) {*/

        req.question.choices = _.shuffle(req.question.choices);

        res.render('student/quiz-question', { 
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            quiz: req.tutorialmodels.Quiz.quiz,
            question: req.question,
            n: req.tutorialmodels.Quiz.quiz.questions.indexOf(req.question.id)
        });
    //});*
};

exports.endQuiz = function (req, res) {
    /*async.waterfall([
        function (next) {
            models.Course.findById(req.params.course, next);
        },
        function (course, next) {
            models.Quiz.findById(req.params.quiz, function (err, quiz) {
                next(err, course, quiz);
            });
        }
    ],
    function (err, course, quiz, question, i) {
        res.render('student/end', { course: course, quiz: quiz });
    });*/
};