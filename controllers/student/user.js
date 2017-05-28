const config = require('../../lib/config');
// Retrieve login form
exports.getLogin = (req, res) => {
    if (req.user)
        return res.redirect('/student/courses');
    let auth0Config = config.auth0;
    res.render('login', {
        bodyClass: 'login',
        title: 'Login',
        domain : auth0Config.domain,
        clientId : auth0Config.clientId,
        callbackUrl : auth0Config.callbackUrl
    });
};
// Logout user
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/login');
};