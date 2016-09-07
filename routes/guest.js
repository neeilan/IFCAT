var router = require('express').Router();

var controllers = require('../controllers');

// routes
router.get('/login', controllers.User.login);

module.exports = router;