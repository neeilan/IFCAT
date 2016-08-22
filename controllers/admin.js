var passport = require('../config/passport');

exports.login = function (req, res, next) {
    passport.authenticate('local-login', {
        successRedirect : '/admin/courses',
        failureRedirect : '/login',
        failureFlash : true
    })(req, res, next);
};