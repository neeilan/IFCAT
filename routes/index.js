var router = require('express').Router();
var authenticate = require('../middlewares/authenticate');
var QuizController = require('../controllers/quiz-controller');

module.exports = function (app, passport, acl) {
    
    // Show home page
    router.get('/', [authenticate], function (req, res) {
        res.status(200).send('home');
    });

    // Register user
    router.post('/register', passport.authenticate('local-register', {
        successRedirect : '/',
        failureRedirect : '/quiz'
    }));

    // Show login page
    router.get('/login', function (req, res) {
        res.status(200).send('login');
    });

    // Login user
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    // Logout user
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    // Show home page
    router.get('/quiz', function (req, res) {
        console.log(req);
        res.status(200).send('quiz');
    });

    app.use(router);
};