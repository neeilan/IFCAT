var _ = require('lodash'),
    async = require('async');
var config = require('../lib/config'),
    models = require('../models');

// Retrieve group responses
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
// Retrieve marks by student
exports.getMarkListByStudent = function (req, res) {
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
// Retrieve marks by tutorial quiz
exports.getMarkListByTutorialQuiz = function (req, res) {
    models.TutorialQuiz.findOne({ tutorial: req.tutorial, quiz: req.quiz }).exec(function (err, tutorialQuiz) {
        models.Response.find({ _id: { $in: tutorialQuiz.responses }}).populate({
            path: 'group',
            model: models.Group,
            populate: {
                path: 'members',
                model: models.User
            }
        }).exec(function (err, responses) {
            var students = {};
            // tally points per student
            _.each(responses, function (response) {
                if (response.group) {
                    _.each(response.group.members, function (member) {
                        if (!students.hasOwnProperty(member.id)) {
                            member.tutorial = req.tutorial;
                            member.quiz = req.quiz;
                            member.group = response.group;
                            member.points = 0;
                            students[member.id] = member;
                        }
                        students[member.id].points += response.points; 
                    });
                }
            });
            // sort by UTORid
            students = _.sortBy(_.values(students), function (student) { return student.student.UTORid });
            // either export CSV
            if (req.query.export === '1') {
                var data = _.map(students, function (student) {
                        return [
                            student.student.UTORid, 
                            student.student.number, 
                            student.name.full,
                            'TUT ' + student.tutorial.number,
                            student.quiz.name,
                            'Group ' + student.group.name,
                            student.points
                        ];
                    });
                // set headings
                data.unshift(['UTORid', 'Student No.', 'Name', 'Tutorial', 'Quiz', 'Group', 'Mark']);
                // send CSV
                res.setHeader('Content-disposition', 'attachment; filename=marks.csv'); 
                res.set('Content-Type', 'text/csv'); 
                res.status(200).send(_.reduce(data, function (l, r) { return l + r.join() + "\n" }, ''));
            // or load page
            } else {
                res.render('admin/tutorial-quiz-marks', {
                    title: 'Marks',
                    course: req.course,
                    tutorial: req.tutorial,
                    quiz: req.quiz,
                    students: students
                });
            }
        });
    });
};
// Retrieve marks by course
exports.getMarkListByCourse = function (req, res) {


    models.TutorialQuiz.find({ 
        _id: {
            $in: req.body.tutorialQuizzes || [] 
        }
    }).exec(function (err, tutorialQuizzes) {
        async.mapSeries(tutorialQuizzes, function (tutorialQuiz, done) {
            models.Response.find({ _id: { $in: tutorialQuiz.responses }}).populate({
                path: 'group',
                model: models.Group,
                populate: {
                    path: 'members',
                    model: models.User
                }
            }).exec(function (err, responses) {
                if (err)
                    return done(err);
                var students = {};
                // tally points per student
                _.each(responses, function (response) {
                    if (response.group) {
                        _.each(response.group.members, function (member) {
                            if (!students.hasOwnProperty(member.id)) {
                                member.tutorial = tutorialQuiz.tutorial;
                                member.quiz = tutorialQuiz.quiz;
                                member.group = response.group;
                                member.points = 0;
                                students[member.id] = member;
                            }
                            students[member.id].points += response.points; 
                        });
                    }
                });
                // sort by UTORid
                students = _.sortBy(_.values(students), function (student) { return student.student.UTORid });
                done(null, students);
            });
        }, function (err, students) {
            students = _.flatten(students); 
            // export CSV
            if (req.query.export === '1' && students.length) {
                data = _.map(students, function (student) {
                    return [
                        student.student.UTORid, 
                        student.student.number, 
                        student.name.full,
                        'TUT ' + student.tutorial.number,
                        student.quiz.name,
                        'Group ' + student.group.name,
                        student.points
                    ];
                });
                // set headings
                data.unshift(['UTORid', 'Student No.', 'Name', 'Tutorial', 'Quiz', 'Group', 'Mark']);
                // send CSV
                res.setHeader('Content-disposition', 'attachment; filename=marks.csv'); 
                res.set('Content-Type', 'text/csv'); 
                res.status(200).send(_.reduce(data, function (l, r) { return l + r.join() + "\n" }, ''));
            } else {
                // better to have a page to show all marks but...
                res.redirect('/admin/courses/' + req.course.id + '/conduct');
            }
        });
    });
};