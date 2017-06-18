const _ = require('lodash'),
    models = require('../../models'),
    wilson = require('../../lib/wilson');
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
    req.quiz.withQuestions().execPopulate().then(() => {
        if (req.query.sort === 'votes') {
            // sort questions based on votes
            req.quiz.questions = _.orderBy(req.quiz.questions, question => {
                return wilson.lowerBound(question.votes.up.length, question.votes.up.length + question.votes.down.length);
            }, 'desc');
        }
        res.render(/* TBD */);
    });
};
// Update user's vote to question
exports.updateVote = (req, res) => {
    req.question.votes.up.pull(req.user._id);
    req.question.votes.down.pull(req.user._id);
    // req.body.vote = up|down
    req.question.votes[req.body.vote].push(req.user._id);
    req.question.save(err => {
        res.json(/* TBD */);
    });
};