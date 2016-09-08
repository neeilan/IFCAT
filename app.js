/*jslint node: true*/

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    flash = require('connect-flash'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    session = require('express-session');

var config = require('./config/common'),
    routes = require('./routes');

var app = express();

// locals
app.locals._ = require('lodash');
app.locals.moment = require('moment');
app.locals.dateFormat = 'MMMM Do YYYY @ h:mm a';

mongoose.connect(config.db.url);

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8000);

// view engine setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/', express.static(__dirname + '/public'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash'));

app.use(morgan('dev'));

app.use(methodOverride('_method'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

app.use(cookieParser());
app.use(session({ 
    secret: config.session.secret, 
    saveUninitialized: true, 
    resave: true 
}));
app.use(flash());

var passport = require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

// pass the user object to all responses
app.use(function (req, res, next) {
    res.locals.url = req.originalUrl;
    res.locals.user = req.user;
    next();
});

app.use('/', routes.guest);
app.use('/student', routes.student);
app.use('/admin', routes.admin);

app.use(function (err, req, res, next) {
    res.status(err.status || 500).render('error', { error: err });
});

// start server
app.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});