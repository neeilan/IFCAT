var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy,
    Auth0Strategy = require('passport-auth0'),
    auth0Config = require('./common').auth0;
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
}, function (req, email, password, done) {
    User.findOne({ 'local.email': email }, function (err, user) {
        if (err) {
            return done(err);
        } 
        if (!user) {
            return done(null, false, req.flash('message', 'Invalid email. Please try again.'));
        }
        // @TODO use async version
        if (!user.isValidPassword(password)) {
            return done(null, false, req.flash('message', 'Invalid password. Please try again.'));    
        }
        return done(null, user); 
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
    User.findOne({ UTORid : profile._json.UTORid })
    .exec()
    .then(function(user){
        if (!user){
            user = new User();
            user.UTORid = profile._json.UTORid;
            user.name.first = profile._json.firstName;
            user.name.last = profile._json.lastName;
            user.oauth.id = profile._json.user_id;
            user.roles = ['student'];
            user.save()
            .then(function(user){
                return done(null, user);
            })
            .catch(function(e){
                console.log(e);
                return done(e);
            });
        } else {
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