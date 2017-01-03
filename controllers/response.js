var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');

var models = require('../models');

// Retrieve responses
exports.getResponseList = function (req, res) {
    req.tutorialQuiz.withResponses().execPopulate().then(function () {
        var responses = _.filter(req.tutorialQuiz.responses, function (response) {
            return response.group.id === req.group.id;
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
    var filename =
        req.course.code + 
        '-tut' + req.tutorialQuiz.tutorial.number +
        '-group' + req.group.name + 
        '.csv';

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
        data.push(['Course', req.course.code, req.course.name]);
        data.push(['Tutorial', req.tutorialQuiz.tutorial.number]);
        data.push(['Quiz', req.tutorialQuiz.quiz.name]);
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
        tutorialQuizzes = tutorialQuizzes.filter(tq => tq.groups.length > 0);
        var marks = _.map(tutorialQuizzes, function (tutorialQuiz) {
            var result = {
                tutorialQuiz: tutorialQuiz,
                group: _.find(tutorialQuiz.groups, function (group) {
                    return group.members.indexOf(req.us3r.id) > -1;
                }),
                points: tutorialQuiz.responses ? _.reduce(tutorialQuiz.responses, function (sum, response) {
                    if (response.group.members.indexOf(req.us3r.id) > -1) {
                        return sum + response.points;
                    }
                    return sum;
                }, 0) : 0,
            };
            
            if (result.group){
                result.teachingPoints = (result.group.teachingPoints.reduce(function(sum, recipient){
                    if (recipient === req.us3r.id)
                        sum ++;
                    return sum;
                }, 0))/2
            } else {
                result.points = 0;
                result.teachingPoints = 0;
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
        
        if (!marks[0].group){
            res.end('No marks are currently available for this student');
        } else {
            res.render('admin/student-marks', {
                student: req.us3r,
                course: req.course,
                tutorial: req.tutorial,
                marks: marks,
                totalPoints: totalPoints,
                totalTeachingPoints : totalTeachingPoints
            });
        }
    });
};