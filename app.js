/*jslint node: true*/

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    flash = require('connect-flash'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    session = require('express-session'),
    MongoStore = require("connect-mongo")(session),
    passportSocketIo = require('passport.socketio');

var config = require('./config/common'),
    routes = require('./routes');

var app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

// locals
app.locals.io = io; // io global
app.locals._ = require('lodash');
app.locals.moment = require('moment');
app.locals.dateFormat = 'MMMM Do YYYY @ h:mm a';

mongoose.connect(config.db.url);

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8000);

// view engine setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash'));
app.use('/socketioclient', express.static(__dirname + '/node_modules/socket.io-client'));
app.use('/', express.static(__dirname + '/public'));

app.use(morgan('dev'));

app.use(methodOverride('_method'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

app.use(cookieParser());

var sessionStore = new MongoStore({ mongooseConnection : mongoose.connection });
app.use(session({ 
    secret: config.session.secret, 
    saveUninitialized: false, 
    store : sessionStore,
    resave: false 
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


/////////////////// realtime quiz testing endpoint ------------------
var models = require('./models');

io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: config.session.secret,
  store: sessionStore,
  passport: passport,
  cookieParser: cookieParser
}));

app.get('/quiz', function (req, res){
    require('./models').TutorialQuiz.findOne({})
    .exec()
    .then(function(tutQuiz){
        res.render('student/start-quiz.ejs', { quiz : tutQuiz } )
    })
})

io.on('connection', function(socket){
    
     if (socket.request.user && socket.request.user.logged_in) {
    //   console.log(socket.request.user);
      console.log('authenticated socket');
      socket.join('user:' + socket.request.user._id); // Since a user can connect from multiple devices/ports, use socket.io rooms instead of hashmap
     }
    else{
        console.log('unauthenticated socket');
    }
    
    socket.on('requestQuiz', function(tutQuizId){
        
        models.TutorialQuiz.findById(tutQuizId)
        .populate([{
            path : 'quiz',
            model : 'Quiz',
            populate : {
                path : 'questions',
                model : 'Question'
            }
        },
        {
            path : 'groups',
            model : 'Group'
        }])
        .exec()
        .then(function(tutQuiz){
            // console.log(tutQuiz);
            var studentHasAGroup = false;
            // if student already in a group, add them to approriate socket.io room
            tutQuiz.groups.forEach(function(group){
                // console.log(group);
                if (group.members.indexOf(socket.request.user._id) > -1) {
                    socket.join('group:'+group._id);
                    console.log('Joined enrolled group');
                    studentHasAGroup = true;
                }
            })
            if (!studentHasAGroup) {
                // student doesn't have a group - add them to one
                var groupsWithRoom = tutQuiz.groups.filter(function(group){
                    if (!tutQuiz.max || !tutQuiz.max.membersPerGroup){
                        tutQuiz.max = { membersPerGroup : 2 }                     // MAKE THIS DEFAULT BEHAVIOR IN SCHEMA
                    }
                    return (group.members.length < tutQuiz.max.membersPerGroup);
                })
                
                if (groupsWithRoom.length > 0) {
                    // there is a group with room, let's add the student to it
                    models.Group.findByIdAndUpdate(groupsWithRoom[0]._id, { $push : { members : socket.request.user._id } }, { new : true }, function (err,doc){
                        if (err)
                            console.log(err);
                    });
                    console.log('Joining existing group '+ groupsWithRoom[0]._id);
                    socket.join('group:' + groupsWithRoom[0]._id);
                }
                else {
                    // there are no groups with room - let's make a new group
                    var group = new models.Group();
                    group.name = (tutQuiz.groups.length + 1).toString();
                    group.members = [ socket.request.user._id ];
                    group.save( function(err, group){
                     if (!err) {
                         // we also need to add the group to this tutorialQuiz
                         models.TutorialQuiz.update({ _id : tutQuiz._id }, { $push : { groups :  group._id } }, { new : true }, function(err, doc){
                            if (err) 
                                console.log(err);
                         })
                         console.log('Created and joined a new group ', group._id);
                         socket.join('group:'+group._id)
                     }
                    });
                }
                
            }
            socket.emit('quizData', tutQuiz )
        })
    })
    
    
    socket.on('selectedAsDriver', function(data){
        io.emit('startQuiz');
    })
    
    socket.on('showQuestionToGroup', function(n){
        io.emit('renderQuestion', n);
    })
    
    socket.on('propagateScoresToGroup', function(score){
        io.emit('updateScores', score)
    })
    
})
//////////////// -------------


// start server
http.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});