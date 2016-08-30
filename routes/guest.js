var router = require('express').Router();

var UserController = require('../controllers/user');

// routes
router.get('/login', UserController.login);

module.exports = router;