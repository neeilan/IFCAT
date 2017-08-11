const config = require('../../lib/config');
// Retrieve login form
exports.getLogin = (req, res) => {
    if (req.user)
        return res.redirect('/student/courses');
    res.render('login', {
        bodyClass: 'login',
        title: 'Login',
        domain : config.auth0.domain,
        clientId : config.auth0.clientId,
        callbackUrl : config.auth0.callbackUrl
    });
};
// Logout user
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/login');
};