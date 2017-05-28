const _ = require('lodash'),
    async = require('async'),
    config = require('../lib/config'),
    csv = require('csv'),
    models = require('../models');
// Retrieve list of students for course
exports.getStudentsByCourse = (req, res) => {
    req.course.withTutorials().withStudents().execPopulate().then(err => {
        res.render('admin/course-students', {
            bodyClass: 'students',
            title: 'Students',
            course: req.course,
            students: req.course.students
        });
    }); 
};
// Retrieve list of students matching search query
exports.getStudentsBySearchQuery = (req, res) => {
    models.User.findBySearchQuery({ q: req.query.q, roles: ['student'] }, (err, students) => {
        res.render('admin/tables/course-students-search-results', { 
            course: req.course, 
            students: students 
        });
    });
};
// Retrieve list of students for tutorial
exports.getStudentsByTutorial = (req, res) => {
    req.tutorial.withStudents().execPopulate().then(() => {
        res.render('admin/tutorial-students', {
            title: 'Students', 
            course: req.course, 
            tutorial: req.tutorial
        });
    });
};
// Add student to course
exports.addStudents = (req, res) => {
    req.course.update({ $addToSet: { students: { $each: req.body.students || [] }}}, err => {
        if (err)
            req.flash('error', 'An error has occurred while trying perform operation.');
        else
            req.flash('success', 'The list of students has been updated.');
        res.redirect(`/admin/courses/${req.course.id}/students`);
    });
};
// Update students in tutorials
exports.editStudents = (req, res) => {
    req.body.tutorials = req.body.tutorials || {};
    req.course.withTutorials().execPopulate().then(() => {
        async.eachSeries(req.course.tutorials, (tutorial, done) => {
            tutorial.update({ $set: { students: req.body.tutorials[tutorial.id] || [] }}, done);
        }, err => {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'The list of tutorials has been updated.');
            res.sendStatus(200);
        });
    });
};
// Delete students from course and associated tutorials
exports.deleteStudents = (req, res) => {
    let students = req.body.students || [];
    async.series([
        done => {
            req.course.update({ 
                $pull: { students: { $in: students }}
            }, done);
        },
        done => {
            models.Tutorial.update({ 
                _id: { $in: req.course.tutorials }
            }, { 
                $pull: { students: { $in: students }}
            }, {
                multi: true
            }, done);
        }
    ], err => {
        if (err)
            req.flash('error', 'An error has occurred while trying perform operation.');
        else
            req.flash('success', 'The list of students has been updated.');
        res.sendStatus(200);
    });
};
// Import list of students
exports.importStudents = (req, res) => {
    // read spreadsheet
    csv.parse(req.file.buffer.toString(), {
        columns: true,
        delimiter: ',',
        skip_empty_lines: true
    }, (err, rows) => {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform operation.');
            return res.redirect(`/admin/courses/${req.course.id}/students`);
        }
        // process records
        async.eachSeries(rows, (row, done) => {
            row.student = {};
            row.name = {};
            row.local = {};
            // normalize properties
            _.forOwn(row, (val, key) => {
                if (/^utorid/i.test(key))
                    row.student.UTORid = val;
                else if (/^student(.+)/i.test(key))
                    row.student.number = val;
                else if (/^first/i.test(key))
                    row.name.first = val;
                else if (/^last/i.test(key))
                    row.name.last = val;
                else if (/^e\-?mail/i.test(key))
                    row.local.email = val;
                else if (/^password/i.test(key))
                    row.local.password = val;
                else if (/^tutorial/i.test(key))
                    row.tutorial = val;
            });
            // save
            async.waterfall([
                function saveStudent(done) {
                    models.User.findOne({ 'student.UTORid': row.student.UTORid }, (err, user) => {
                        if (err)
                            return done(err);
                        if (!user)
                            user = new models.User();
                        user.set(row);
                        user.roles.addToSet('student');
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            done(null, user);
                        });
                    });
                },
                function addIntoCourse(user, done) {
                    req.course.withTutorials().execPopulate().then(function () {
                        req.course.update({ $addToSet: { students: user.id }}, function (err) {
                            done(err, user);
                        });
                    });
                },
                function addIntoTutorial(user, done) {
                    // skip if no tutorial is given
                    if (!row.tutorial)
                        return done();
                    async.eachSeries(req.course.tutorials, function (tutorial, done) {
                        if (_.toInteger(tutorial.number) === _.toInteger(row.tutorial))
                            tutorial.update({ $addToSet: { students: user.id }}, done);
                        else
                            tutorial.update({ $pull: { students: user.id }}, done);
                    }, done);
                }
            ], done);
        }, err => {
            if (err)
                req.flash('error', 'An error has occurred while trying to perform operation.');
            else
                req.flash('success', 'The students have been imported.');
            res.redirect(`/admin/courses/${req.course.id}/students`);
        });
    });
};

// TO-FIX!

// Retrieve courses enrolled for student
exports.getCourses = (req, res) => {
    models.Course.findByStudent(req.user.id).exec(function (err, courses) { 
        res.render('student/courses', { courses: courses });
    });
};
// Retrieve quizzes within course
exports.getQuizzes = (req, res) => {
    req.course.withTutorials().execPopulate().then(function () {
        // find tutorials that student is in
        var tutorials = req.course.tutorials.filter(function (tutorial) {
            return (tutorial.students.indexOf(req.user.id) > -1);
        });
        // find tutorial quizzes
        if (tutorials) {
            models.TutorialQuiz.find({ tutorial: tutorials[0].id, published: true }).populate('quiz').exec(function (err, tutorialQuizzes) {
                // //console.log('tutorial', tutorials[0]);
                // //console.log('tutorialQuizzes', tutorialQuizzes);
                res.render('student/tutorial-quizzes', { 
                    course: req.course,
                    tutorial: tutorials[0],
                    tutorialQuizzes: tutorialQuizzes 
                });
            });
        }
    });
};