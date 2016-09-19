var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve responses
exports.getResponseList = function (req, res) {
    req.tutorialQuiz.withResponses(req.group.id).execPopulate().then(function () {
        // ugly: filter out group responses
        var responses = _.filter(req.tutorialQuiz.responses, function (response) {
            return response.group.id === req.group.id;
        });
        // tally the points
        var totalPoints = _.reduce(responses, function (sum, response) {
            console.log(sum, response.points);
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