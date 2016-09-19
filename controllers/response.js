var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');

var models = require('../models');

// Retrieve responses
exports.getResponseList = function (req, res) {
    req.tutorialQuiz.withResponses().execPopulate().then(function () {
        // ugly: filter out group responses
        var responses = _.filter(req.tutorialQuiz.responses, function (response) {
            return response.group.id === req.group.id;
        });
        // tally the points
        var totalPoints = _.reduce(responses, function (sum, response) {
            return sum + response.points;
        }, 0);

        res.render('admin/group-responses', { 
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            group: req.group,
            responses: responses,
            totalPoints: totalPoints
        });
    });
};
// Export responses
exports.exportResponseList = function (req, res) {
    var data = [];
    var filename = 'tut' + req.tutorialQuiz.tutorial.number + '-group' + req.group.name + '.csv';

    req.tutorialQuiz.withResponses().execPopulate().then(function () {
        // ugly: filter out group responses
        var responses = _.filter(req.tutorialQuiz.responses, function (response) {
            return response.group.id === req.group.id;
        });
        // tally the points
        var totalPoints = _.reduce(responses, function (sum, response) {
            return sum + response.points;
        }, 0);
        // build information
        data.push(['Tutorial', req.tutorialQuiz.tutorial.number]);
        data.push(['Quiz', req.tutorialQuiz.quiz.name]);
        data.push(['Group', req.group.name]);
        data.push([]);
        // build header row
        data.push(['No.', 'Question', '# of attempts', 'Points awarded']);
        // build rows
        for (var i = 0, len = responses.length; i < len; i++) {
            data.push([
                responses[i].question.number, 
                responses[i].question.question, 
                responses[i].attempts,
                responses[i].points
            ]);
        }
        // build footer row
        data.push(['', '', 'Total Points', totalPoints]);
        // send CSV
        res.setHeader('Content-disposition', 'attachment; filename=' + filename); 
        res.set('Content-Type', 'text/csv'); 
        res.status(200).send(data.map(function (row) { return row.join(); }).join("\n"));
    });
};