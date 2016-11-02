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

router.get('/', function(req,res){
    if (!req.user){
        res.redirect('/login');
    }
    else if (req.user.roles.indexOf('admin') > -1){
        res.redirect('/admin/courses');
    }
    else{
        res.redirect('/student/courses');
    }
})

module.exports = router;