const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
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
exports.getQuestions = (req, res) => { 
    req.quiz.withQuestions().execPopulate().then(function () {
        res.render('admin/pages/quiz-questions', {
            bodyClass: 'questions',
            title: 'Questions',
            course: req.course,
            quiz: req.quiz
        });
    });
};
// Sort list of questions
exports.sortQuestions = (req, res) => {
    var newOrder = req.body.questions || [];
    // sort questions based off order given
    req.quiz.questions.sort((a, b) => {
        return newOrder.indexOf(a.toString()) < newOrder.indexOf(b.toString()) ? -1 : 1;
    });
    req.quiz.save(err => {
        if (err)
            return res.status(500).send('An error has occurred while trying to perform operation.');
        res.sendStatus(200);
    });
};
// Retrieve specific question for quiz
exports.getQuestion = (req, res) => {
    var question = req.question || new models.Question();
    req.course.withFiles().execPopulate().then(function () {
        res.render('admin/pages/quiz-question', {
            bodyClass: 'question',
            title: question.isNew ? 'Add New Question' : 'Edit Question',
            course: req.course, 
            quiz: req.quiz, 
            question: question
        });
    });
};
// Add new question for quiz
exports.addQuestion = (req, res) => {
    var question = new models.Question();
    async.series([
        done => question.store(req.body).save(done),
        done => req.quiz.update({ $addToSet: { questions: question.id }}, done)
    ], function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been created.', question.number);
        let backUrl = `/admin/courses/${req.course.id}/quizzes/${req.quiz.id}/questions`;
        res.redirect(req.body.back === '1' ? backUrl : backUrl + '/new');
    });
};
// Update specific question for quiz
exports.editQuestion = (req, res) => {
    req.question.store(req.body).save(err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been updated.', req.question.number);
        res.redirect(`/admin/courses/${req.course.id}/quizzes/${req.quiz.id}/questions/${req.question.id}/edit`);
    });
};
// Delete specific question for quiz
exports.deleteQuestion = (req, res) => {
    req.question.remove(err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Question <b>%s</b> has been deleted.', req.question.number);
        res.sendStatus(200);
    });
};
// Preview question
exports.previewQuestion = (req, res) => {
    var question = new models.Question();
        question.number = _.trim(req.body.number)
        question.question = _.trim(req.body.question);
        question.type = req.body.type;
        question.useLaTeX = !!req.body.useLaTeX;

    req.course.withFiles().execPopulate().then(function () {
        var files = req.body.files || [];
        // add files
        question.files = _.filter(req.course.files, function (file) {
            return files.indexOf(file.id) > -1;
        });
        // add unique links
        _.each(req.body.links, function (link) {
            link = _.trim(link);
            if (link) {
                if (!url.parse(link).protocol)
                    link = 'http://' + link;
                if (question.links.indexOf(link) === -1)
                    question.links.push(link);
            }
        });
        // add unique choices
        _.forOwn(req.body.choices, function (choice) {
            choice = _.trim(choice);
            if (choice && question.choices.indexOf(choice) === -1)
                question.choices.push(choice);
        });
        // shuffle choices
        if (!!req.body.shuffleChoices)
            question.choices = _.shuffle(question.choices);

        res.render('admin/pages/quiz-question-preview', { 
            title: 'Preview Question', 
            course: req.course, 
            question: question 
        });
    });
};