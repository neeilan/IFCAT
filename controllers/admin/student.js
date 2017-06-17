const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    csv = require('csv'),
    models = require('../../models');
    
exports.getStudentByParam = (req, res, next, id) => {
    models.User.findOne({ _id: id, roles: { $in: ['student'] }}, (err, student) => {
        if (err)
            return next(err);
        if (!student)
            return next(new Error('No student is found.'));
        req.student = student;
        next();
    });
};
// Retrieve list of students for course
exports.getStudentsByCourse = (req, res) => {
    req.course.withTutorials().withStudents().execPopulate().then(err => {
        res.render('admin/pages/course-students', {
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
        res.render('admin/partials/course-students-search-results', { 
            course: req.course, 
            students: students 
        });
    });
};
// Retrieve list of students for tutorial
exports.getStudentsByTutorial = (req, res) => {
    req.tutorial.withStudents().execPopulate().then(() => {
        res.render('admin/pages/tutorial-students', {
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
    async.series([
        done => csv.parse(req.file.buffer.toString(), { columns: true, delimiter: ',', skip_empty_lines: true }, done),
        done => models.Tutorial.find({ _id: { $in: req.course.tutorials }}, done)
    ], (err, results) => {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform operation.');
            return res.redirect(`/admin/courses/${req.course.id}/students`);
        }
        let [rows, tutorials] = results;
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
            let student;
            // save
            async.series([
                done => {
                    models.User.findOne({ 'student.UTORid': row.student.UTORid }, (err, us3r) => {
                        if (err)
                            return done(err);
                        student = us3r || new models.User();
                        student.set(row);
                        student.roles.addToSet('student');
                        student.save(done);
                    });
                },
                done => {
                    req.course.update({ $addToSet: { students: student._id }}, done);
                },
                done => {
                    if (row.tutorial) {
                        async.eachSeries(tutorials, (tutorial, done) => {
                            if (_.toInteger(tutorial.number) === _.toInteger(row.tutorial))
                                tutorial.update({ $addToSet: { students: student._id }}, done);
                            else
                                tutorial.update({ $pull: { students: student._id }}, done);
                        }, done);
                    } else 
                        return done();
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