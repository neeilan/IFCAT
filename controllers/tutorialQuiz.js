var _ = require('lodash');

var models = require('../models');

// Retrieve course
exports.getQuiz = function (req, res, next, tutorialQuiz) {
    models.TutorialQuiz.findById(tutorialQuiz).populate('tutorial quiz').exec(function (err, tutorialQuiz) {
        if (err) {
            return next(err);
        }
        if (!tutorialQuiz) {
            return next(new Error('No tutorial quiz is found.'));
        }
        console.log('got tutorial quiz');
        req.tutorialQuiz = tutorialQuiz;
        next();
    });
};
// Retrieve quizzes within tutorial
exports.getQuizListForAdmin = function (req, res) {
    models.TutorialQuiz.findQuizzesByTutorial(req.tutorial).then(function (tutorialQuizzes) {
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
        if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }
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
    res.render('admin/tutorial-quiz', { 
        course: req.course, 
        tutorialQuiz: req.tutorialQuiz
    });
};
// Edit quiz for tutorial
exports.editQuiz = function (req, res) {
    req.tutorialQuiz.store(req.body, function (err) {
        if (err) {
            req.flash('failure', 'Unable to save quiz at this time.');
        } else {
            req.flash('success', 'The quiz has been updated successfully.');
        }
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorial-quizzes/' + req.tutorialQuiz.id +
            '/edit'
        );
    });
};
// Publish quiz for tutorial
exports.publishQuiz = function (req, res) {
    req.tutorialQuiz.published = req.body.published;
    req.tutorialQuiz.save(function (err) {
        res.json({ status: true });
    });
};
// Unlock quiz for tutorial
exports.unlockQuiz = function (req, res) {
    req.tutorialQuiz.unlocked = req.body.unlocked;
    req.tutorialQuiz.save(function (err) {
        req.app.locals.io.in('tutorialQuiz:' + req.tutorialQuiz.id)
        .emit('quizUnlocked' , req.tutorialQuiz);
        res.json({ status: true });
    });
};
// Activate quiz for tutorial
exports.activateQuiz = function (req, res) {
    req.tutorialQuiz.active = req.body.active;
    req.tutorialQuiz.save(function (err) {
        req.app.locals.io.in('tutorialQuiz:' + req.tutorialQuiz.id)
        .emit('quizActivated', req.tutorialQuiz);
        res.json({ status: true });
    });
};

// --------------------------------------------------------------------------------------------------

//
exports.startQuiz = function (req, res) {

     res.render('student/start-quiz.ejs', {
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            quiz: req.tutorialQuiz.quiz
        });
};

exports.getNextQuestion = function (req, res) {

        req.question.choices = _.shuffle(req.question.choices);

        res.render('student/quiz-question', { 
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            quiz: req.tutorialmodels.Quiz.quiz,
            question: req.question,
            n: req.tutorialmodels.Quiz.quiz.questions.indexOf(req.question.id)
        });

};

exports.endQuiz = function (req, res) {

};