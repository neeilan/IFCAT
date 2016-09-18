var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');

var models = require('../models');

// 

exports.getUser = function (req, res, next, us3r) {
    models.User.findById(us3r, function (err, us3r) {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!us3r) {
            return next(new Error('No us3r is found.'));
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
    models.User.find({}).exec(function (err, users) {
        res.render('admin/users', { users: models.User.sortByRole(users) });
    }); 
};

exports.getUserForm = function (req, res) {
    res.render('admin/user', { us3r: req.us3r || new models.User() });
};
// Add new user
exports.addUser = function (req, res) {
    models.User.create(req.body, function (err, user) {
        res.redirect('/admin/users');
    });
};
// Update specific user
exports.editUser = function (req, res) {
    req.us3r.name.first = req.body.name.first;
    req.us3r.name.last = req.body.name.last;
    req.us3r.roles = req.body.roles;
    req.us3r.local.email = req.body.local.email;
    if (req.body.local.password) {
        req.us3r.local.password = req.us3r.generateHash(req.body.local.password);
    }
    req.us3r.save(function (err) {
        res.redirect('/admin/users/' + req.us3r.id + '/edit');
    });
};
// Delete specific user
exports.deleteUser = function (req, res) {
    req.us3r.remove(function (err) {
        res.json({ status: true });
    });
};