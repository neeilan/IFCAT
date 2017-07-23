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
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 5,
        re = new RegExp(`(${req.query.q.replace(/\s/g, '|').trim()})`, 'i');
    models.User.findAndCount({
        $and: [
            { $or: [{ 'name.first': re },{ 'name.last': re },{ 'student.UTORid': re },{ 'student.number': re }] },
            { roles: { $in: ['student'] }}
        ]
    }, {
        select: 'name student',
        page: page,
        perPage: perPage,
        sort: 'name.first name.last'
    }, (err, users, count, pages) => {
        res.render('admin/partials/course-students-search-results', { 
            course: req.course, 
            students: users,
            pagination: {
                count: `${count} user${count !== 1 ? 's' : ''} matched`,
                page: page,
                pages: pages,
                params: {
                    q: req.query.q
                }
            }
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
    let users = req.body.users || [];
    req.course.update({ $addToSet: { students: { $each: users }}}, err => {
        if (err)
            req.flash('error', 'An error has occurred while trying perform operation.');
        else
            req.flash('success', 'The list of students has been updated.');
        res.redirect(`/admin/courses/${req.course.id}/students`);
    });
};
// Update students in tutorials
exports.editStudents = (req, res) => {
    let dict = _.transpose(req.body['+users'] || {});
    models.Tutorial.find({ _id: req.course.tutorials }, (err, tutorials) => {
        async.eachSeries(tutorials, (tutorial, done) => {
            let students = tutorial.students.map(String);
                students = _.difference(students, req.body.users);
                students = _.union(students, dict[tutorial._id]);
            tutorial.update({ students: students }, done);
        }, err => {
            if (err)
                return res.status(400).send('An error occurred while trying to perform operation.');
            res.send('The list of tutorials has been updated.');
        });
    });
};
// Delete students from course and associated tutorials
exports.deleteStudents = (req, res) => {
    let users = req.body['-users'] || [];
    async.series([
        done => {
            req.course.update({ $pull: { students: { $in: users }}}, done);
        },
        done => {
            models.Tutorial.update({ 
                _id: { $in: req.course.tutorials }
            }, { 
                $pull: { students: { $in: users }}
            }, {
                multi: true
            }, done);
        }
    ], err => {
        if (err)
            return res.status(400).send('error', 'An error has occurred while trying perform operation.');
        res.send('The list of students has been updated.');
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