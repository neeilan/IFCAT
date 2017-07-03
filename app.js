const bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    flash = require('connect-flash'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passportSocketIo = require('passport.socketio');

const config = require('./lib/config'),
    routes = require('./routes');

const app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

// locals
app.locals._ = require('lodash');
app.locals.dateFormat = 'MMMM Do YYYY @ h:mm a';
app.locals.io = io;
app.locals.moment = require('moment');  

mongoose.connect(config.db.url);

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8080);

// view engine setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/bootbox', express.static(__dirname + '/node_modules/bootbox'));
app.use('/bootstrap-switch', express.static(__dirname + '/node_modules/bootstrap-switch/dist'));
app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash'));
app.use('/socketioclient', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/sweetalert', express.static(__dirname + '/node_modules/sweetalert/dist'));
app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

const sessionStore = new MongoStore({ mongooseConnection : mongoose.connection });

app.use(session({ 
    secret: config.session.secret, 
    saveUninitialized: false, 
    store : sessionStore,
    resave: false 
}));

app.use(flash());

var passport = require('./lib/passport');

app.use(passport.initialize());
app.use(passport.session());

// pass the user object to all responses
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    res.locals.url = req.originalUrl;
    res.locals.user = req.user;
    next();
});

app.use('/', routes.guest);
app.use('/student', routes.student);
app.use('/admin', routes.admin);

app.use((err, req, res, next) => {
    res.status(err.status || 500).render('error', { error: err });
});

io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: config.session.secret,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
}));

// Socket io handler for quizzes
io.on('connection', require('./socket.io/quizHandlers.js')(io));

// Start server
http.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});