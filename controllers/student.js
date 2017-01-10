var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');
var config = require('../lib/config'),
    models = require('../models');

// Retrieve list of students for course
exports.getStudentListByCourse = function (req, res) {
    var currentPage = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 20,
        start = (currentPage - 1) * perPage, 
        end = start + perPage;
    req.course.withTutorials().withStudents().execPopulate().then(function (err) {
        var totalPages = _.round(req.course.students.length / perPage), pages = [];
        // build pages
        for (var page = 1; page <= totalPages; page++) {    
            if ((currentPage <= 2 && page <= 5) || 
                (currentPage - 2 <= page && page <= currentPage + 2) ||
                (totalPages - 2 < currentPage && totalPages - 5 < page)) pages.push(page);
        }
        res.render('admin/course-students', {
            title: 'Students',
            course: req.course,
            students: _.slice(req.course.students, start, end),
            currentPage: currentPage,
            perPage: perPage,
            totalPages: totalPages,
            pages: pages
        });
    }); 
};
// Retrieve list of students matching search query
exports.getStudentListBySearchQuery = function (req, res) {
    models.User.findBySearchQuery(req.query.q, 'student').exec(function (err, students) {
        res.render('admin/tables/course-students-search-results', { 
            course: req.course, 
            students: students 
        });
    });
};
// Retrieve list of students for tutorial
exports.getStudentsByTutorial = function (req, res) {
    var currentPage = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 20,
        start = (currentPage - 1) * perPage, 
        end = start + perPage;
    req.tutorial.withStudents().execPopulate().then(function () {
        var totalPages = _.round(req.tutorial.students.length / perPage), pages = [];
        // build pages
        for (var page = 1; page <= totalPages; page++) {    
            if ((currentPage <= 2 && page <= 5) || 
                (currentPage - 2 <= page && page <= currentPage + 2) ||
                (totalPages - 2 < currentPage && totalPages - 5 < page)) pages.push(page);
        }
        res.render('admin/tutorial-students', {
            title: 'Students', 
            course: req.course, 
            tutorial: req.tutorial,
            students: _.slice(req.tutorial.students, start, end),
            currentPage: currentPage,
            perPage: perPage,
            totalPages: totalPages,
            pages: pages
        });
    });
};
// Add student to course
exports.addStudentList = function (req, res) {
    async.each(req.body.students || [], function (student, done) {
        req.course.update({ $addToSet: { students: student }}, done);
    }, function (err) {
        if (err)
            req.flash('error', 'An error has occurred while trying perform operation.');
        else
            req.flash('success', 'The students have been added into the course.');
        res.redirect('/admin/courses/' + req.course.id + '/students');
    });
};
// Delete student from course and associated tutorial
exports.deleteStudent = function (req, res) {
    req.course.withTutorials().execPopulate().then(function () {
        async.waterfall([
            function deleteFromCourse(done) {
                req.course.update({ $pull: { students: req.us3r.id }}, done);
            },
            function deleleFromTutorials(course, done) {
                async.eachSeries(req.course.tutorials, function (tutorial, done) {
                    tutorial.update({ $pull: { students: req.us3r.id }}, done);
                }, done);
            }
        ], function (err) {
            if (err)
                req.flash('error', 'An error has occurred while trying perform operation.');
            else
                req.flash('success', 'Student <b>%s</b> has been removed from the course.', req.us3r.name.full);
            res.sendStatus(200);
        });
    });
};
// Update students' tutorials
exports.editStudentList = function (req, res) {
    var tutorials = {};
    // group user IDs by tutorial IDs
    _.each(req.body.tutorials, function (id, userId) {
        if (!tutorials.hasOwnProperty(id))
            tutorials[id] = [];
        tutorials[id].push(userId);
    });
    // save
    req.course.withTutorials().execPopulate().then(function () {
        async.eachSeries(req.course.tutorials, function (tutorial, done) {
            var newStudents = [];
            if (tutorials.hasOwnProperty(tutorial.id))
                newStudents = tutorials[tutorial.id]; 
            // check if changes were made
            if (_.difference(tutorial.students, newStudents))
                tutorial.update({ $set: { students: newStudents }}, done);
            else
                done();
        }, function (err) {
            if (err)
                req.flash('error', 'An error occurred while trying to perform operation.');
            else
                req.flash('success', 'The students have been updated.');
            res.redirect('/admin/courses/' + req.course.id + '/students');
        });
    });
};
// Import list of students
exports.importStudentList = function (req, res) {
    // read spreadsheet
    csv.parse(req.file.buffer.toString(), {
        columns: true,
        delimiter: ',',
        skip_empty_lines: true
    }, function (err, rows) {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform operation.');
            return res.redirect('/admin/courses/' + req.course.id + '/students');
        }
        // process records
        async.eachSeries(rows, function (row, done) {
            row.student = {};
            row.name = {};
            row.local = {};
            // normalize properties
            _.forOwn(row, function (val, key) {
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
                    models.User.findOne({ 'student.UTORid': row.student.UTORid }, function (err, user) {
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
        }, function (err) {
            if (err)
                req.flash('error', 'An error has occurred while trying to perform operation.');
            else
                req.flash('success', 'The students have been imported.');
            res.redirect('/admin/courses/' + req.course.id + '/students');
        });
    });
};

// TO-FIX!

// Retrieve courses enrolled for student
exports.getCourseList = function (req, res) {
    models.Course.findByStudent(req.user.id).exec(function (err, courses) { 
        res.render('student/courses', { courses: courses });
    });
};
// Retrieve quizzes within course
exports.getQuizList = function (req, res) {
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