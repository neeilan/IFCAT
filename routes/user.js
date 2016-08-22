var router = require('express').Router();

var UserController = require('../controllers/user');

// routes
router.post('/signup', UserController.signup);
router.get('/login', UserController.login);
router.get('/logout', UserController.logout);

module.exports = router;