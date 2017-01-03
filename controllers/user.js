var _ = require('lodash'),
    async = require('async'),
    csv = require('csv'),
    util = require('util');
    
var config = require('../lib/config'),
    models = require('../models');

// 
exports.getUser = function (req, res, next, user) {
    models.User.findById(user, function (err, user) {
        if (err)
            return next(err);
        if (!user)
            return next(new Error('No user is found.'));
        req.us3r = user; // careful: req.user is used by passport
        next();
    });
};
// Retrieve login form
exports.getLoginForm = function (req, res) {
    if (req.baseUrl === '/admin') {
        if (req.user)
            return res.redirect('/admin/courses');
        res.render('admin/login', { title: 'Login' });
    } else {
        if (req.user)
            return res.redirect('/student/courses');
        var auth0Config = config.auth0;
        res.render('login', {
            domain : auth0Config.domain,
            clientId : auth0Config.clientId,
            callbackUrl : auth0Config.callbackUrl,
            title: 'Login'
        });
    }
};
// Logout user
exports.logout = function (req, res) {
    req.logout();
    res.redirect(req.baseUrl === '/admin' ? '/admin/login' : '/login');
};
// Retrieve list of users
exports.getUserList = function (req, res) {
    var currentPage = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 20;
    async.parallel([
        function (done) {
            models.User.count().exec(done);
        },
        function (done) {
            models.User.find(null, null, { 
                sort: {
                    'name.first': 1,
                    'name.last': 1
                }, 
                skip: (currentPage - 1) * perPage, 
                limit: perPage
            }).exec(done);
        }
    ], function (err, results) {
        var totalPages = _.round(results[0] / perPage), page = 1, pages = [];
        // build set of pages
        while (page <= totalPages) {    
            if ((currentPage <= 2 && page <= 5) || 
                (currentPage - 2 <= page && page <= currentPage + 2) ||
                (totalPages - 2 < currentPage && totalPages - 5 < page))
                pages.push(page);
            page++;
        }
        res.render('admin/users', {
            title: 'Users',
            users: results[1],
            currentPage: currentPage,
            perPage: perPage,
            totalPages: totalPages,
            pages: pages
        });
    }); 
};
// Retrieve user form
exports.getUserForm = function (req, res) {
    if (!req.us3r)
        req.us3r = new models.User();
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
        res.sendStatus(200);
    });
};
// Get help guide
exports.getHelp = function (req, res) {
    res.render('admin/help');
};
// Reset administrator
exports.install = function (req, res, next) {
    models.User.findOne({ 'local.email': 'admin' }, function (err, user) {
        if (err)
            return next(err);
        if (!user)
            user = new models.User();
        user.set({
            name: {
                first: 'Admin'
            },
            local: {
                email: 'admin',
                password: '@dm1n'
            },
            roles: ['admin']
        }).save(function (err) {
            if (err)
                return next(err);
            res.send('Sweet Christmas.');
        });
    });
};