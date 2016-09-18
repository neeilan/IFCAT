var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve responses
exports.getResponseList = function (req, res) {
    req.group.withResponses().execPopulate().then(function () {
        res.render('admin/group-responses', { 
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            group: req.group,
            responses: req.group.responses
        });
    });
};