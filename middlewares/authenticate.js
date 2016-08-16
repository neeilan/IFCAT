module.exports = function (req, res, next) {
    if (/(login|register)$/.test(req.originalUrl) || req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};