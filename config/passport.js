var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// store user ID into session
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    // get user (without their password) using the ID set in the session
    User.findById(id, '-password', function (err, user) {
        done(null, user);
    });
});

passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
}, function (req, email, password, done) {
    process.nextTick(function() {
        User.findOne({ email: email }, function (err, user) {
            if (err) {
                return done(err);
            }
            // check to see if email is already taken
            if (user) {
                return done(null, false, { 'message': 'This email is already in use.' });
            }
            // save new user
            user = new User(req.body);
            user.save(function (err) {
                if (err) {
                    return done(err);
                }
                return done(null, user);
            });
        });
    });
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
}, function (req, email, password, done) {
    process.nextTick(function() {
        User.findOne({ email: email }, function (err, user) {
            if (err) { var x;
                return done(err);
            } 
            if (!user) {
                return done(null, false, { message: 'Invalid email address.' });
            }
            User.authenticate(password, function (err, res) {
                if (res) {
                    return done(null, user);
                }
                return done(null, false, { message: 'Invalid password.' });
            });    
        });
    });
}));



// TODO: add another strategy

module.exports = passport;