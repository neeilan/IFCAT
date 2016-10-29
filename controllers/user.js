var _ = require('lodash'),
    async = require('async'),
    csv = require('csv');
    
var config = require('../lib/config'),
    models = require('../models');

// 
exports.getUser = function (req, res, next, user) {
    models.User.findById(user, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('No user is found.'));
        }
        req.us3r = user; // careful: req.user is used by passport
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
        title: 'Login'
    }); 
};
// Logout user
exports.logout = function (req, res) {
    req.logout();
    res.redirect(req.baseUrl === '/admin' ? '/admin/login' : '/login');
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
    var user = new models.User(req.body);
    user.save(function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', 'User <b>%s</b> has been created.', user.name.full);
        res.redirect('/admin/users');
    });
};
// Update specific user
exports.editUser = function (req, res) {
    req.us3r.set(req.body).save(function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', 'User <b>%s</b> has been updated.', req.us3r.name.full);
        res.redirect('/admin/users/' + req.us3r.id + '/edit');
    });
};
// Delete specific user
exports.deleteUser = function (req, res) {
    req.us3r.remove(function (err) {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', 'User <b>%s</b> has been deleted.', req.us3r.name.full);
        res.json({ status: !err });
    });
};
// Add administrator
exports.install = function (req, res, next) {
    var user = new models.User({
        local: {
            email: 'admin',
            password: 'admin'
        },
        roles: ['admin']
    });
    user.save(function (err) {
        if (err)
            return next(err);
        res.send('Sweet Christmas.');
    });
};