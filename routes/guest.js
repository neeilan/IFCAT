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

module.exports = router;