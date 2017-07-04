const _ = require('lodash'),
    async = require('async'),
    config = require('../../lib/config'),
    models = require('../../models');
//
exports.getUserByParam = (req, res, next, id) => {
    models.User.findById(id, (err, user) => {
        if (err)
            return next(err);
        if (!user)
            return next(new Error('No user is found.'));
        req.us3r = user; // careful: req.user is used by passport
        next();
    });
};
// Retrieve login form
exports.getLogin = (req, res) => {
    if (req.user)
        return res.redirect('/admin/courses');
    res.render('admin/pages/login', { 
        bodyClass: 'login',
        title: 'Login' 
    });
};
// Logout user
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/admin/login');
};
// Retrieve list of users
exports.getUsers = (req, res) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 10,
        sort = req.query.sort || 'name.first name.last';
    models.User.findAndCount({}, {
        select: 'local.email student oauth.id name roles',
        page: page,
        perPage: perPage,
        sort: sort
    }, (err, users, count, pages) => {
        res.render('admin/pages/users', {
            bodyClass: 'users',
            title: 'Users',
            users: users,
            pagination: {
                count: `${count} user${count !== 1 ? 's' : ''}`,
                page: page,
                pages: pages,
                perPage: perPage
            }
        });
    });
};
// Retrieve user form
exports.getUser = (req, res) => {
    var user = req.us3r || new models.User();
    res.render('admin/pages/user', {
        title: user.isNew ? 'Add New User' : 'Edit User', 
        us3r: user 
    });
};
// Add new user
exports.addUser = (req, res) => {
    var user = new models.User(req.body);
    user.save(err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', 'User <b>%s</b> has been created.', user.name.full);
        res.redirect('/admin/users');
    });
};
// Update specific user
exports.editUser = (req, res) => {
    req.us3r.set(req.body).save(err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', 'User <b>%s</b> has been updated.', req.us3r.name.full);
        res.redirect(`/admin/users/${req.us3r.id}/edit`);
    });
};
// Delete specific user
exports.deleteUser = (req, res) => {
    req.us3r.remove(err => {
        if (err)
            req.flash('error', 'An error occurred while trying to perform action.');
        else
            req.flash('success', 'User <b>%s</b> has been deleted.', req.us3r.name.full);
        res.sendStatus(200);
    });
};
// Reset administrator
exports.install = (req, res, next) => {
    models.User.findOne({ 'local.email': 'admin' }, (err, user) => {
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
                password: '@dm!n'
            },
            roles: ['admin']
        }).save(err => {
            if (err)
                return next(err);
            res.send('Sweet Christmas.');
        });
    });
};