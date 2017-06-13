const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    csv = require('csv'),
    models = require('../../models');
// Retrieve group responses
exports.getResponsesByGroup = (req, res) => {
    req.group.populate({
        path: 'responses',
        populate: {
            path: 'question'
        }
    }, err => {
        res.render('admin/pages/group-responses', {
            bodyClass: 'group-responses',
            title: 'Responses',
            course: req.course,
            tutorial: req.tutorial,
            quiz: req.quiz,
            group: req.group
        });
    });
};
// Retrieve marks by student
exports.getMarksByStudent = (req, res) => {
    models.TutorialQuiz.aggregate([{
        $match: { tutorial: { $in: req.course.tutorials }} 
    }, {
        $lookup: { from: 'tutorials', localField: 'tutorial', foreignField: '_id', as: 'tutorial' }
    }, {
        $unwind: '$tutorial'
    }, {
        $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quiz' }
    }, {
        $unwind: '$quiz'
    }, {
        $unwind: '$groups'
    }, {
        $lookup: { from: 'groups', localField: 'groups', foreignField: '_id', as: 'group' }
    }, {
        $unwind: '$group'
    }, {
        $match: { 'group.members': { $in: [req.student._id] }}
    }, {
        $unwind: '$group.responses'
    }, {
        $lookup: { from: 'responses', localField: 'group.responses', foreignField: '_id', as: 'response' }
    }, {
        $unwind: '$response'
    }, {
        $group: {
            _id: '$_id',
            tutorial: { $first: '$tutorial' },
            quiz: { $first: '$quiz' },
            group: { $first: '$group' },
            totalPoints: { $sum: '$response.points' }
        }
    }], (err, tutorialQuizzes) => {
        res.render('admin/pages/student-marks', {
            title: 'Marks',
            course: req.course,
            student: req.student,
            tutorialQuizzes: tutorialQuizzes,
            totalPoints: _.sumBy(tutorialQuizzes, tutorialQuiz => tutorialQuiz.totalPoints)
        });
    });
};
// Retrieve students' marks by tutorial quiz
exports.getMarksByTutorialQuiz = (req, res) => {
    models.TutorialQuiz.aggregate([{
        $match: { tutorial: req.tutorial._id, quiz: req.quiz._id }
    }, {
        $unwind: '$groups'
    }, {
        $lookup: { from: 'groups', localField: 'groups', foreignField: '_id', as: 'group' }
    }, {
        $unwind: '$group'
    }, {
        $unwind: '$group.members'
    }, {
        $lookup: { from: 'users', localField: 'group.members', foreignField: '_id', as: 'member' }
    }, {
        $unwind: '$member'
    }, {
        $unwind: '$group.responses'
    }, {
        $lookup: { from: 'responses', localField: 'group.responses', foreignField: '_id', as: 'response' }
    }, {
        $unwind: '$response'
    }, {
        $group: {
            _id: '$student._id',
            member: { $first: '$member' },
            group: { $first: '$group' },
            totalPoints: { $sum: '$response.points' }
        }
    }, {
        $sort: { _id: 1 }
    }], (err, data) => {
        // export marks into CSV
        if (req.query.export === '1') {
            data = _.map(data, d => [
                d.member.student.UTORid,
                d.member.student.number,
                `${d.member.name.first} ${d.member.name.last}`,
                `TUT ${req.tutorial.number}`,
                req.quiz.name,
                `Group ${d.group.name}`,
                d.totalPoints
            ]);
            // set headings
            data.unshift(['UTORid', 'Student No.', 'Name', 'Tutorial', 'Quiz', 'Group', 'Mark']);
            // send CSV
            res.setHeader('Content-disposition', 'attachment; filename=marks.csv'); 
            res.set('Content-Type', 'text/csv');
            return csv.stringify(data, (err, output) => res.send(output));
        }
        // display marks
        res.render('admin/pages/tutorial-quiz-marks', {
            bodyClass: 'marks',
            title: 'Marks',
            course: req.course,
            tutorial: req.tutorial,
            quiz: req.quiz,
            data: data
        });
    });
};
// Retrieve marks by course
exports.getMarksByCourse = (req, res) => {
    models.TutorialQuiz.aggregate([{
        $match: { _id: { $in: req.body.tutorialQuizzes || [] }}
    }, {
        $lookup: { from: 'tutorials', localField: 'tutorial', foreignField: '_id', as: 'tutorial' }
    }, {
        $unwind: '$tutorial'
    }, {
        $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quiz' }
    }, {
        $unwind: '$quiz'
    }, {
        $unwind: '$groups'
    }, {
        $lookup: { from: 'groups', localField: 'groups', foreignField: '_id', as: 'group' }
    }, {
        $unwind: '$group'
    }, {
        $unwind: '$group.members'
    }, {
        $lookup: { from: 'users', localField: 'group.members', foreignField: '_id', as: 'member' }
    }, {
        $unwind: '$member'
    }, {
        $unwind: '$group.responses'
    }, {
        $lookup: { from: 'responses', localField: 'group.responses', foreignField: '_id', as: 'response' }
    }, {
        $unwind: '$response'
    }, {
        $group: {
            _id: { tutorialQuiz: '_id', member: '$member._id' },
            group: { $first: '$group' },
            member: { $first: '$member' },
            totalPoints: { $sum: '$response.points' }
        }
    }, {
        $sort: { '_id.member': 1, '_id.tutorialQuiz': 1 }
    }], (err, data) => {
        // export marks into CSV
        if (req.query.export === 'true' && members.length) {
            data = _.map(data, d => [
                d.member.student.UTORid,
                d.member.student.number,
                `${d.member.name.first} ${d.member.name.last}`,
                `TUT ${req.tutorial.number}`,
                req.quiz.name,
                `Group ${d.group.name}`,
                d.totalPoints
            ]);
            // set headings
            data.unshift(['UTORid', 'Student No.', 'Name', 'Tutorial', 'Quiz', 'Group', 'Mark']);
            // send CSV
            res.setHeader('Content-disposition', 'attachment; filename=marks.csv'); 
            res.set('Content-Type', 'text/csv'); 
            return csv.stringify(data, (err, output) => res.send(output));
        }
        res.redirect(`/admin/courses/${req.course._id}/conduct`);
    });
};

/*
// Retrieve group responses
exports.getResponsesByGroup = (req, res) => {
    async.series([
        done => models.TutorialQuiz.findOne({ tutorial: req.tutorial._id, quiz: req.quiz._id }, done),
        done => models.Response.find({ group: req.group._id }).populate('question').exec(done)
    ], (err, data) => {
        res.render('admin/pages/group-responses', {
            bodyClass: 'group-responses',
            title: 'Responses',
            course: req.course,
            tutorial: req.tutorial,
            quiz: req.quiz,
            tutorialQuiz: data[0],
            group: req.group,
            responses: data[1],
            totalPoints: _.reduce(data[1], (sum, response) => sum + response.points, 0)
        });
    });
};
// Retrieve marks by student
exports.getMarksByStudent = (req, res) => {
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
        
        res.render('admin/pages/student-marks', {
            title: 'Marks',
            course: req.course,
            student: req.us3r,
            marks: marks,
            totalPoints: totalPoints,
            totalTeachingPoints : totalTeachingPoints
        });
    });
};
// Retrieve marks by tutorial quiz
exports.getMarksByTutorialQuiz = (req, res) => {
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
                res.render('admin/pages/tutorial-quiz-marks', {
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
exports.getMarksByCourse = (req, res) => {
    models.TutorialQuiz.find({ 
        _id: {
            $in: req.body.tutorialQuizzes || [] 
        }
    }).populate('tutorial quiz').exec(function (err, tutorialQuizzes) {
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
*/