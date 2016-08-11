/*jslint node: true*/

//# app.js

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    directory = require('serve-index'),
    errorhandler = require('errorhandler'),
    express = require('express'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    multer = require('multer'), 
    session = require('express-session');

var app = express();

// configuration
mongoose.connect('mongodb://localhost:27017/uteach');

var passport = require('./config/passport');
var acl = require('./config/acl');

// setup express application
app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');
app.use(morgan('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'thisisasecret', saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());

// routes
require('./routes/index')(app, passport, acl);
require('./routes/admin')(app, passport, acl);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', 
        app.get('port'), app.get('env'));
});