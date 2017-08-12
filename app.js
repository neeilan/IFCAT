const lodash = require('./utils/lodash.mixin'),
    bodyParser = require('body-parser'),
    config = require('./utils/config'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    flash = require('connect-flash'),
    methodOverride = require('method-override'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passportSocketIo = require('passport.socketio');

const app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

// local variables
app.locals._ = lodash;
app.locals.DATEFORMAT = 'YYYY-MM-DD';
app.locals.io = io;
app.locals.moment = moment;

// application settings
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// static assets
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/bootbox', express.static(__dirname + '/node_modules/bootbox'));
app.use('/bootstrap-switch', express.static(__dirname + '/node_modules/bootstrap-switch/dist'));
app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash'));
app.use('/socketioclient', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/sweetalert', express.static(__dirname + '/node_modules/sweetalert/dist'));
app.use(express.static(__dirname + '/public'));

// other middlewares
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// database
mongoose.Promise = global.Promise;
mongoose.connect(config.database.url, { useMongoClient: true });
//mongoose.set('debug', true);

// sessions
const sessionStore = new MongoStore({ mongooseConnection : mongoose.connection });

app.use(session({ 
    secret: config.session.secret, 
    saveUninitialized: false, 
    store : sessionStore,
    resave: false 
}));

app.use(flash());

// authentication
const passport = require('./utils/passport');

app.use(passport.initialize());
app.use(passport.session());

// local variables
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    res.locals.path = req.path;
    res.locals.query = req.query;
    res.locals.user = req.user;
    next();
});

// routes
const routes = require('./routes');

app.use('/', routes.guest);
app.use('/student', routes.student);
app.use('/admin', routes.admin);

// error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).render('error', { error: err });
});

// sockets
io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: config.session.secret,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
}));

// socket io handler for quizzes
io.on('connection', require('./socket.io/quizHandlers.js')(io));

// server
http.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});