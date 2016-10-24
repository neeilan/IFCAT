var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');
    
var config = require('../lib/config'),
    models = require('../models');

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
    var auth0Config = config.auth0;
    res.render('login', {
        domain : auth0Config.domain,
        clientId : auth0Config.clientId,
        callbackUrl : auth0Config.callbackUrl,
        title: 'Login'
    }); 
};
// Retrieve admin login form
exports.getAdminLoginForm = function (req, res) {
    res.render('admin/login', {
        bodyClass: 'login',
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
            bodyClass: 'users', 
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
            req.flash('error', 'An error occurred while trying to perform action.');
        } else {
            req.flash('success', 'The user <b>%s</b> has been created.', user.name.full);
        }
        res.redirect('/admin/users');
    });
};
// Update specific user
exports.editUser = function (req, res) {
    req.us3r.store(req.body, function (err) {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform action.');
        } else {
            req.flash('success', 'The user <b>%s</b> has been updated.', req.us3r.name.full);
        }
        res.redirect('/admin/users/' + req.us3r.id + '/edit');
    });
};
// Delete specific user
exports.deleteUser = function (req, res) {
    req.us3r.remove(function (err) {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform action.');
        } else {
            req.flash('success', 'The user <b>%s</b> has been deleted.', req.us3r.name.full);
        }
        res.json({ status: !!err });
    });
};