var async = require('async'),
    passport = require('passport');
var LocalStrategy = require('passport-local').Strategy,
    Auth0Strategy = require('passport-auth0'),
    auth0Config = require('./config').auth0;

var User = require('../models').User;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, '-password', function (err, user) { 
        if (err){
            return done(err);
        }
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
                return done(null, false, { 'message': 'Email is already taken' });
            }
            // create a new user
            user = new User({
                local: {
                    email: email,
                    password: password
                },
                roles: ['student']
            });
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
    passReqToCallback: true,
    failureFlash: true
}, function (req, email, password, done) {
    User.findOne({ 'local.email': email }, function (err, user) {
        if (err || !user) {
            return done(null, false, { message: 'Invalid email' });
        }
        user.checkPassword(password, function (err, res) {
            if (err || !res) {
                return done(null, false, { message: 'Invalid password' });
            }
            done(null, user);
        });
    });
}));

// Configure Passport to use Auth0
var strategy = new Auth0Strategy({
    domain:       auth0Config.domain,
    clientID:     auth0Config.clientId,
    clientSecret: auth0Config.clientSecret,
    callbackURL:  auth0Config.callbackUrl || 'http://localhost:3000/callback'
}, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    console.log('profile')
    console.log(profile._json)

    var UTORid = profile._json.user_metadata.UTORid ? profile._json.user_metadata.UTORid.trim().toLowerCase() : '';

    User.findOne({ 'student.UTORid': UTORid }).exec().then(function(user){
        if (!user){
            console.log('Creating new user')
            user = new User();
            user.student.UTORid = UTORid;
            user.name.first = profile._json.user_metadata.first_name;
            user.name.last = profile._json.user_metadata.last_name;
            user.oauth.id = profile._json.clientID;
            user.roles = ['student'];
            user.save().then(function(user){
                return done(null, user);
            }).catch(function(e){
                console.log(e);
                return done(e);
            });
        } else {
            console.log('existing user with Utorid match:')
            console.log(user);
            done(null, user);
        }
    })
    .catch(function(e){
        return done(e);
    });
});

passport.use(strategy);

module.exports = passport;