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
    session = require('express-session'),
    dbConfig = require('./config/db.js');

var app = express();

// configuration
mongoose.connect(dbConfig.url);

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
var path = require('path');
app.get('/', function(req,res){
    res.sendFile(path.join(__dirname + '/public/index.html'));
})
require('./routes/student')(app, passport, acl);
require('./routes/admin')(app, passport, acl);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', 
        app.get('port'), app.get('env'));
});