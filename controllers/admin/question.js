const _ = require('lodash'),
    async = require('async'),
    models = require('../../models'),
    url = require('url');
// Retrieve course
exports.getQuestionByParam = (req, res, next, id) => {
    models.Question.findById(id, (err, question) => {
        if (err)
            return next(err);
        if (!question) 
            return next(new Error('No question is found.'));
        req.question = question;
        next();
    });
};
// Retrieve list of questions for quiz
exports.getQuestions = (req, res, next) => {
    let options = { 
        populate: { path: 'submitter', model: 'User' }
    };
    if (req.query.sort && req.query.sort != 'votes') {
        options.options = { sort: req.query.sort };
    }
    req.quiz.withQuestions(options).execPopulate().then(() => {
        let questions = req.quiz.questions;
        // sort questions by voting score
        if (req.query.sort == 'votes')
            questions = _.orderBy(questions, 'votes.score', 'desc');
        // group questions by status
        questions = _.groupBy(questions, question => question.submitter && !question.approved ? 'pending' : 'approved');

        res.render('admin/pages/quiz-questions', {
            mathjax: true,
            bodyClass: 'questions-page',
            title: 'Questions',
            course: req.course,
            quiz: req.quiz,
            questions: questions
        });
    }, next);
};
// Sort list of questions
exports.sortQuestions = (req, res, next) => {
    let o = req.body.questions || [];
    // sort questions based off order given
    req.quiz.questions.sort((a, b) => o.indexOf(a.toString()) < o.indexOf(b.toString()) ? -1 : 1);
    req.quiz.save(err => {
        if (err) 
            return next(err);
        req.flash('success', 'List of questions have been reordered.');
        res.redirect('back');
    });
};
// Retrieve specific question for quiz
exports.getQuestion = (req, res, next) => {
    let question = req.question || new models.Question();
    // set default options
    _.forOwn(req.quiz.default, (v, k) => {
        question[k] = _.defaultTo(question[k], v);
    });

    req.course.withFiles().execPopulate().then(() => {
        question.populate('submitter').execPopulate().then(() => {
            res.render('admin/pages/quiz-question', {
                bodyClass: 'question-page',
                title: question.isNew ? 'Add New Question' : 'Edit Question',
                course: req.course, 
                quiz: req.quiz, 
                question: question
            });
        }, next);
    }, next);
};
// Add new question for quiz
exports.addQuestion = (req, res, next) => {
    let question = new models.Question();
    let url = `/admin/courses/${req.course._id}/quizzes/${req.quiz._id}/questions`;
    async.series([
        done => question.store(req.body).save(done),
        done => req.quiz.update({ $addToSet: { questions: question._id }}, done)
    ], err => {
        if (err) 
            return next(err);
        req.flash('success', 'Question <b>%s</b> has been created.', question.number);
        res.redirect(req.body.back === '1' ? url : 'back');
    });
};
// Update specific question for quiz
exports.editQuestion = (req, res, next) => {
    req.question.store(req.body).save(err => {
        if (err) 
            return next(err);
        req.flash('success', 'Question <b>%s</b> has been updated.', req.question.number);
        res.redirect('back');
    });
};
// Delete specific question for quiz
exports.deleteQuestion = (req, res, next) => {
    req.question.remove(err => {
        if (err) 
            return next(err);
        req.flash('success', 'Question <b>%s</b> has been deleted.', req.question.number);
        res.redirect('back');
    });
};
// Preview question
exports.previewQuestion = (req, res, next) => {
    // var question = new models.Question();
    //     question.number = _.trim(req.body.number)
    //     question.question = _.trim(req.body.question);
    //     question.type = req.body.type;
    //     question.useLaTeX = !!req.body.useLaTeX;

    // req.course.withFiles().execPopulate().then(function () {
    //     var files = req.body.files || [];
    //     // add files
    //     question.files = _.filter(req.course.files, function (file) {
    //         return files.indexOf(file.id) > -1;
    //     });
    //     // add unique links
    //     _.each(req.body.links, function (link) {
    //         link = _.trim(link);
    //         if (link) {
    //             if (!url.parse(link).protocol)
    //                 link = 'http://' + link;
    //             if (question.links.indexOf(link) === -1)
    //                 question.links.push(link);
    //         }
    //     });
    //     // add unique choices
    //     _.forOwn(req.body.choices, function (choice) {
    //         choice = _.trim(choice);
    //         if (choice && question.choices.indexOf(choice) === -1)
    //             question.choices.push(choice);
    //     });
    //     // shuffle choices
    //     if (!!req.body.shuffleChoices)
    //         question.choices = _.shuffle(question.choices);

    //     res.render('admin/pages/quiz-question-preview', { 
    //         title: 'Preview Question', 
    //         course: req.course, 
    //         question: question 
    //     });
    // });
};