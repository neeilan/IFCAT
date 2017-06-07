const models = require('../../models');
// Retrieve tutorial quiz
exports.getTutorialQuizByParam = (req, res, next, id) => {
    models.TutorialQuiz.findById(id).populate('tutorial quiz').exec((err, tutorialQuiz) => {
        if (err)
            return next(err);
        if (!tutorialQuiz)
            return next(new Error('No tutorial quiz is found.'));
        req.tutorialQuiz = tutorialQuiz;
        next();
    });
};
// Retrieve quizzes within course
exports.getQuizzesForStudent = (req, res) => { 
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
exports.startQuiz = (req, res) => {
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