var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');
var config = require('../lib/config'),
    models = require('../models');

// Retrieve responses
exports.getResponseList = function (req, res) {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate({
        path: 'responses',
        model: models.Response,
        populate: [{
            path: 'group',
            model: models.Group
        }, {
            path: 'question',
            models: models.Question
        }]
    }).exec(function (err, tutorialQuiz) {
        var responses = _.filter(tutorialQuiz.responses, function (response) {
            return response.group && response.group.id === req.group.id;
        });
        // tally the points
        var totalPoints = _.reduce(responses, function (sum, response) {
            return sum + response.points;
        }, 0);

        // var teachingPoints = {};
        // _.each(req.group.teachingPoints, function(recipient){
        //     if (!(recipient in teachingPoints)){
        //         teachingPoints[recipient] = 1;
        //     }
        //     else {
        //         teachingPoints[recipient]++;
        //     }
        // })
        
        res.render('admin/group-responses', {
            title: 'Responses',
            course: req.course,
            tutorial: req.tutorial,
            quiz: req.quiz,
            tutorialQuiz: tutorialQuiz,
            group: req.group,
            responses: responses,
            totalPoints: totalPoints
        });
    });
};
// Export responses
exports.exportResponseList = function (req, res) {
    var data = [];

    models.TutorialQuiz.findOne({ tutorial: req.tutorial.id, quiz: req.quiz.id }).populate({
        path: 'responses',
        model: models.Response,
        populate: [{
            path: 'group',
            model: models.Group
        }, {
            path: 'question',
            models: models.Question
        }]
    }).exec(function (err, tutorialQuiz) {
        var filename = req.course.code + 
            '-tut' + req.tutorial.number +
            '-group' + req.group.name + 
            '.csv';
        // ugly: filter out group responses
        var responses = _.filter(tutorialQuiz.responses, function (response) {
            return response.group && response.group.id === req.group.id;
        });
        // tally the points
        var totalPoints = _.reduce(responses, function (sum, response) {
            return sum + response.points;
        }, 0);
        // build information
        data.push(['Course', req.course.code, req.course.name]);
        data.push(['Tutorial', req.tutorial.number]);
        data.push(['Quiz', req.quiz.name]);
        data.push(['Group', req.group.name]);
        data.push([]);
        // build header row
        data.push(['No.', 'Question', '# of attempts', 'Points awarded']);
        // build rows
        _.each(responses, function (res) {
            data.push([res.question.number, res.question.question, res.attempts, res.points]);
        });
        // build footer row
        data.push(['', '', 'Total Points', totalPoints]);
        // send CSV
        res.setHeader('Content-disposition', 'attachment; filename=' + filename); 
        res.set('Content-Type', 'text/csv'); 
        res.status(200).send(
            _.reduce(data, function (lines, row) { 
                return lines + row.join() + "\n"; 
            }, '')
        );
    });
};
// Retrieve marks
exports.getMarks = function (req, res) {
    models.TutorialQuiz.find({ tutorial: req.tutorial.id }).populate([{
        path: 'quiz',
        model: models.Quiz
    }, {
        path: 'groups',
        model: models.Group
    }, {
        path: 'responses',
        model: models.Response,
        populate: {
            path: 'group',
            model: models.Group
        }
    }]).exec(function (err, tutorialQuizzes) {
        // ugly: find marks by student
        var marks = _.map(tutorialQuizzes, function (tutorialQuiz) {
            var result = {
                tutorialQuiz: tutorialQuiz,
                group: _.find(tutorialQuiz.groups, function (group) {
                    return group.hasMember(req.us3r.id);
                }),
                points: _.reduce(tutorialQuiz.responses, function (sum, response) {
                    return response.group && response.group.hasMember(req.us3r.id) ? sum + response.points : sum;
                }, 0),
                teachingPoints: 0
            };
            // bug!
            if (result.group) {
                result.teachingPoints = result.group.teachingPoints.reduce(function(sum, recipient){
                    if (recipient === req.us3r.id)
                        sum++;
                    return sum;
                }, 0) / 2
            } 
            return result;
        });
        
        // tally the points
        var totalPoints = _.reduce(marks, function (sum, mark) {
            return sum + mark.points;
        }, 0);

        var totalTeachingPoints = _.reduce(marks, function (sum, mark) {
            return sum + mark.teachingPoints;
        }, 0);
        
        res.render('admin/student-marks', {
            title: 'Marks',
            course: req.course,
            tutorial: req.tutorial,
            student: req.us3r,
            marks: marks,
            totalPoints: totalPoints,
            totalTeachingPoints : totalTeachingPoints
        });
    });
};