var passport = require('../config/passport');

exports.signup = function (req, res, next) {
    passport.authenticate('local-signup', {
        successRedirect : '/admin/courses',
        failureRedirect : '/login',
        failureFlash : true
    })(req, res, next);
};

exports.login = function (req, res) {
    res.render('login', { message: req.flash('message') }); 
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};