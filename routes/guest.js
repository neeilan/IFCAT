var router = require('express').Router();

var controllers = require('../controllers');

// routes
router.get('/login', controllers.User.login);
// router.post('/signup', controllers.User.signup);

module.exports = router;