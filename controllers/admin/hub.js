const async = require('async'),
    models = require('../../models'),
    hubApi = require('../../utils/hubApi');
// 
exports.getApi = (req, res, next) => {
    res.render('admin/pages/hub', {
        bodyClass: 'hub-page',
        title: 'Hub'
    });
};
// 
exports.getUsers = (req, res, next) => {
    hubApi.fetchAllUsers((err, rows) => {
        if (err)
            return next(err);
        async.eachSeries(rows, (row, done) => {
            models.User.findOne({ 'UTORid': row.utorid }, (err, us3r) => {
                if (err) 
                    return done(err);
                us3r = us3r || new models.User();
                us3r.UTORid = row.utorid;
                us3r.local.email = row.email;
                us3r.name.first = row.name.firstName;
                us3r.name.last = row.name.lastName;
                us3r.studentNumber = row.studentNumber;
                us3r.save(done);
            });
        }, err => {
            if (err) 
                return next(err);
            res.sendStatus(200);
        });
    });
};