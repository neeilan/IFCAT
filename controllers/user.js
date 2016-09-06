var async = require('async'),
    _ = require('lodash');

var User = require('../models/user');

exports.getUser = function (req, res, next, us3r) {
    User.findById(us3r, function (err, us3r) {
        if (err) {
            return next(err);
        }
        if (!us3r) {
            return next(new Error('No user is found.'));
        }
        console.log('got us3r');
        req.us3r = us3r; // careful: req.user is used by passport
        next();
    });
};

// route handlers


exports.login = function (req, res) {
    res.render('login', { message: req.flash('message') }); 
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};

exports.getUserList = function (req, res) {
    User.find({}).sort({ 'name.first': 1, 'name.last': 1 }).exec(function (err, users) {
        res.render('admin/users', { users: users });
    }); 
};

exports.getUserForm = function (req, res) {
    res.render('admin/user', { user: req.us3r || new User() });
};

// Add new user for user
exports.addUser = function (req, res) {
    User.create(req.body, function (err, user) {
        res.redirect('/admin/users');
    });
};

// Update specific user
exports.editUser = function (req, res) {    
    _.extend(req.us3r, req.body).save(function (err) {
        res.redirect('/admin/users/' + req.us3r.id + '/edit');
    });
};

// Delete specific user
exports.deleteUser = function (req, res) {
};

// Import list of users
exports.importStudents = function (req, res) {
    // read spreadsheet
    csv.parse(req.file.buffer.toString(), {
        columns: true,
        delimiter: ',',
        skip_empty_lines: true
    }, function (err, rows) {
        // create students
        async.mapSeries(rows, function (row, done) {
            User.create({
                local: {
                    email: row.email
                },
                name: {
                    first: row.first,
                    last: row.last
                },
                roles: _.map(row.roles.split(','), _.trim)
            }, done);
        // add students into course
        }, function (err, newStudents) {
            req.course.students.push(...newStudents);
            req.course.save(function (err) {
                res.redirect('/admin/courses/' + req.course.id + '/students');
            });
        });
    });
};