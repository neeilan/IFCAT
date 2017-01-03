var _ = require('lodash'),
    url = require('url');

var keywords = ['users', 'students', 'teaching-assistants', 'instructors', 'courses', 'tutorials', 'quizzes', 'questions', 'files', 'groups', 'help'];

module.exports = function (req, res, next) {
    if (!req.xhr && req.method === 'GET') {
        res.locals.breadcrumbs = [];
        // split url into segments
        var segments = url.parse(req.url).pathname.substr(1).split('/');
        // check if segment is one of the keywords
        _.each(segments, function (segment, f) {
            if (keywords.indexOf(segment) > -1) {
                res.locals.breadcrumbs.push({
                    text: _.upperFirst(_.startCase(segment)),
                    href: _.take(segments, f + 1).join('/') 
                });               
            }
        });
    }
    next();
};