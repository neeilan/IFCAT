var _ = require('lodash'),
    async = require('async');
var config = require('../lib/config'),
    models = require('../models');

// Retrieve course (deprecated)
exports.getQuiz = function (req, res, next, tutorialQuiz) {
    models.TutorialQuiz.findById(tutorialQuiz).populate('tutorial quiz').exec(function (err, tutorialQuiz) {
        if (err)
            return next(err);
        if (!tutorialQuiz)
            return next(new Error('No tutorial quiz is found.'));
        req.tutorialQuiz = tutorialQuiz;
        next();
    });
};
// Retrieve quizzes within tutorial
exports.getTutorialQuizList = function (req, res) {
    models.TutorialQuiz.find({ tutorial: req.tutorial.id }).populate('quiz').exec(function (err, tutorialQuizzes) {
        res.render('admin/tutorial-quizzes', {
            title: 'Quizzes',
            course: req.course, 
            tutorial: req.tutorial,
            tutorialQuizzes: tutorialQuizzes
        });
    });
};
// Retrieve quiz for tutorial
exports.conductTutorialQuiz = function (req, res) {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate([{
        path: 'tutorial',
        populate: {
            path: 'students',
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }, {
        path: 'groups',
        options: {
            sort: { 'name': 1 }
        }
    }]).exec(function (err, tutorialQuiz) {
        res.render('admin/tutorial-quiz', {
            title: 'Conduct ' + req.quiz.name + ' in TUT ' + req.tutorial.number,
            course: req.course, 
            tutorial: req.tutorial,
            quiz: req.quiz,
            tutorialQuiz: tutorialQuiz,
            students: tutorialQuiz.tutorial.students,
            groups: tutorialQuiz.groups
        });
    });
};
// Publish quiz for tutorial
exports.editTutorialQuiz = function (req, res) {
    models.TutorialQuiz.findOneAndUpdate({ 
        tutorial: req.tutorial, 
        quiz: req.quiz 
    }, { 
        $set: {
            allocateMembers: req.body.allocateMembers,
            max: {
                membersPerGroup: req.body.max.membersPerGroup
            },
            published: req.body.published,
            active: req.body.active,
            archived: req.body.archived
        }
    }, {
        new: true
    }, function (err, tutorialQuiz) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform operation.');
        else {
            req.app.locals.io.in('tutorialQuiz:' + tutorialQuiz.id).emit('quizActivated', tutorialQuiz);
            req.flash('success', '<b>%s</b> settings have been updated for <b>TUT %s</b>.', req.quiz.name, req.tutorial.number);
        }
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorials/' + req.tutorial.id + 
            '/quizzes/' + req.quiz.id + 
            '/conduct'
        );
    });
};

// --------------------------------------------------------------------------------------------------

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
//
exports.startQuiz = function (req, res) {
    if (req.tutorialQuiz.archived){
        req.tutorialQuiz.quiz.withQuestions().execPopulate()
        .then((quiz)=>{
            return models.Group.findOne({ _id : { $in : req.tutorialQuiz.groups }, members :  req.user._id })
            .exec()
            .then(function(group){
                models.Response.find({ group : group._id }).exec()
                .then(function(responses){
                    var responsesMap = {};
                    responses.forEach(res => {responsesMap[res.question] = res}); // easier to do rendering logic with a question to response map
                    res.render('student/archived-quiz.ejs',{
                    quiz : quiz,
                    responses: responsesMap,
                    group : group.name
                    });    
                })
            })
        })
        
    }
    else{
     res.render('student/start-quiz.ejs', {
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            quiz: req.tutorialQuiz.quiz
        });
    }
};