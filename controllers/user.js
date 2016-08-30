exports.login = function (req, res) {
    res.render('login', { message: req.flash('message') }); 
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};