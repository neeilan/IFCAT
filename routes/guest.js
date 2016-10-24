var passport = require('passport'),
    router = require('express').Router();

var controllers = require('../controllers');

// non-authenticated routes
router.get('/login', controllers.User.getLoginForm);

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/login/callback', passport.authenticate('auth0', { 
    failureRedirect: '/login' 
}), function(req, res) {
    res.redirect(req.session.returnTo || '/student/courses');
});

module.exports = router;