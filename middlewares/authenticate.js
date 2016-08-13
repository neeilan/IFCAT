module.exports = function (req, res, next) {
    var urls = ['/api/login', '/api/register'];
    if (urls.indexOf(req.originalUrl) !== -1 || req.isAuthenticated()) {
        return next();
    }
    res.send('not authenticated!');
};