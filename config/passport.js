var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});



passport.deserializeUser(function (id, done) {
    User.findById(id, '-password', function (err, user) { 
        done(null, user);
    });
});


passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback : true
}, 
function (req, email, password, done) {
    process.nextTick(function() {
        User.findOne({ 'local.email': email }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, { 'message': 'This email is already taken.' });
            }
            // create a new user
            user = new User();
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.roles = ['student'];
            user.save(function (err) {
                if (err) {
                    throw err;
                }
                return done(null, user);
            });
        });
    });
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback : true
}, 
function (req, email, password, done) {
    User.findOne({ 'local.email': email }, function (err, user) {
        if (err) {
            return done(err);
        } 
        if (!user) {
            return done(null, false, req.flash('message', 'Invalid email. Please try again.'));
        }
        if (!user.isValidPassword(password)) {
            return done(null, false, req.flash('message', 'Invalid password. Please try again.'));    
        }
        return done(null, user); 
    });
}));

// TODO: add another strategy

module.exports = passport;