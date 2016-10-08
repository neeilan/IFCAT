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

// Retrieve student login form
exports.getLoginForm = function (req, res) {
    res.render('login', { 
        title: 'Login'
    }); 
};
// Retrieve admin login form
exports.getAdminLoginForm = function (req, res) {
    res.render('admin/login', { 
        title: 'Login'
    }); 
};
// Logout user
exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};
// Retrieve list of users
exports.getUserList = function (req, res) {
    models.User.find({}).exec(function (err, users) {
        res.render('admin/users', { 
            title: 'Users',
            users: models.User.sortByRole(users) 
        });
    }); 
};
// Retrieve user form
exports.getUserForm = function (req, res) {
    if (!req.us3r) {
        req.us3r = new models.User();
    }
    res.render('admin/user', {
        title: req.us3r.isNew ? 'Add new user' : 'Edit user', 
        us3r: req.us3r 
    });
};
// Add new user
exports.addUser = function (req, res) {
    var user = new models.User();
    user.store(req.body, function (err) {
        if (err) {
            req.flash('failure', 'Unable to create user at this time.');
        } else {
            req.flash('success', 'The user has been created successfully.');
        }
        res.redirect('/admin/users');
    });
};
// Update specific user
exports.editUser = function (req, res) {
    req.us3r.store(req.body, function (err) {
        if (err) {
            req.flash('failure', 'Unable to update user at this time.');
        } else {
            req.flash('success', 'The user has been updated successfully.');
        }
        res.redirect('/admin/users/' + req.us3r.id + '/edit');
    });
};
// Delete specific user
exports.deleteUser = function (req, res) {
    req.us3r.remove(function (err) {
        res.json({ status: true });
    });
};