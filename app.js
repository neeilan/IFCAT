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
app.use('/bootbox', express.static(__dirname + '/node_modules/bootbox'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash'));
app.use('/socketioclient', express.static(__dirname + '/node_modules/socket.io-client'));
app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome'));
app.use(express.static('public'));

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

io.on('connection', function(socket){
    
    if (socket.request.user && socket.request.user.logged_in) {
       /* We can push user-specific messages / notifications if need be. Only group-specific rooms used in version 1.
       socket.join('user:' + socket.request.user._id); // Since a user can connect from multiple devices/ports, use socket.io rooms instead of hashmap
        */
        var referringUrl = socket.request.headers.referrer;
        
    }
    else{
        socket.disconnect();
    }
    
    socket.on('requestQuiz', function(tutQuizId){
        
        models.TutorialQuiz.findById(tutQuizId)
        .populate([{
            path : 'quiz',
            model : 'Quiz',
            populate : {
                path : 'questions',
                model : 'Question',
                populate : {
                    path : 'files',
                    model : 'File'
                }
            }
        },
        {
            path : 'groups',
            model : 'Group'
        }
        ])
        .exec()
        .then(function(tutQuiz){
            
            var studentsGroup = null;
            
            // Socket room for all students in this tutorial taking this quiz
            socket.join('tutorialQuiz:' + tutQuiz._id);
            
            // if student already in a group, add them to approriate socket.io room
            tutQuiz.groups.forEach(function(group){
                if (group.members.indexOf(socket.request.user._id) > -1) {
                    socket.join('group:'+group._id);
                    console.log('Joined enrolled group ', group.name);
                    studentsGroup = group.name;
                    socket.emit('quizData', { quiz : tutQuiz, groupName : studentsGroup, groupId: group._id} );
                }
            })
            
            
            if (studentsGroup || tutQuiz.active) return; // don't allow new group joining if a quiz is active
            
            // student doesn't already have a group - need to add them to one
            
            var groupsWithRoom = tutQuiz.groups.filter(function(group){
                if (!tutQuiz.max || !tutQuiz.max.membersPerGroup){
                    tutQuiz.max = { membersPerGroup : 2 }                     // MAKE THIS DEFAULT BEHAVIOR IN SCHEMA
                }
                return (group.members.length < tutQuiz.max.membersPerGroup);
            })
            
            // if there's already a group with room, we can put the student there
            if (groupsWithRoom.length > 0) {
                // there is a group with room, let's add the student to it
                models.Group.findByIdAndUpdate(groupsWithRoom[0]._id, { $push : { members : socket.request.user._id } }, { new : true }, function (err,doc){
                    if (err) throw err;
                    console.log('Joining existing group ', groupsWithRoom[0]._id);
                    studentsGroup = groupsWithRoom[0].name;
                    socket.join('group:' + groupsWithRoom[0]._id);
                    socket.emit('quizData', { quiz : tutQuiz, groupName : studentsGroup, groupId: groupsWithRoom[0]._id} );
                });
                
            }
            
            // if all existing groups are full, make a new group for the student
            else {
                // there are no groups with room - let's make a new group
                var group = new models.Group();
                group.name = (tutQuiz.groups.length + 1).toString();
                group.members = [ socket.request.user._id ];
                group.save( function(err, group){
                    studentsGroup = group.name
                    if (!err) {
                         // we also need to add the group to this tutorialQuiz
                         models.TutorialQuiz.update({ _id : tutQuiz._id }, { $push : { groups :  group._id } }, { new : true }, function(err, doc){
                            if (err) throw err;
                         console.log('Created and joined a new group ', group.name);
                         socket.join('group:'+group._id);
                         socket.emit('quizData', { quiz : tutQuiz, groupName : studentsGroup, groupId: group._id } );
                         })
                     }
                });
            }
        })
    })
    
    
    socket.on('nominateSelfAsDriver', function(data){
        models.Group.findById(data.groupId)
        .exec()
        .then(function(group){
            if (!group.driver || group.driver == socket.request.user)
                return models.Group.findByIdAndUpdate(data.groupId, { driver : socket.request.user })
                .exec()
        })
        .then(function(){
            socket.emit('assignedAsDriver', { groupId : data.groupId } );
            io.in('group:' + data.groupId).emit('startQuiz');
        })
    })
    
    socket.on('attemptAnswer', function(data){
        
        models.Response.findOne({ group : data.groupId, question: data.questionId })
        .exec()
        .then(function(response){
            if (!response){
                var res = new models.Response();
                res.group = data.groupId;
                res.question = data.questionId;
                res.attempts = 1;
                res.correct = data.correct;
                res.points = data.correct ? 5 : 0;
                return res.save();
            }
            else{
                // Some logic to prevent students from being dumb and reanswering correct questions and losing points
                // Basically, if they get it right once, they can't worsen their score
                

                var attemptsInc = response.correct ? 0 : 1;
                var newScore = (response.correct) ? response.points : (data.correct) ? (5 - response.attempts) : 0;;
                // If they got it correct before, don't increment
                
                return models.Response.findByIdAndUpdate(response._id,
                { correct: (response.correct || data.correct) , $inc : { attempts : attemptsInc },
                points : (newScore > 0) ? newScore : 0 },
                { new: true } )
                .exec()
        
            }
        })
        .then(function(response){
            if (response.correct){
                io.in('group:' + data.groupId).emit('renderQuestion', 
                { groupId: data.groupId, questionNumber: data.next });
            }
            else {
                io.in('group:' + data.groupId).emit('updateAttempts', 
                { groupId: data.groupId, attempts : response.attempts });
            }

        })
    })

    socket.on('quizComplete', function(data){
        models.Group.findById(data.groupId).populate('members').exec()
        .then(function(group){
            models.Response.find({ group : data.groupId }).exec()
            .then(function(groups){
                return groups.reduce((pre, curr)=> pre.points + curr.points)
            })
            .then(function(score){
                io.in('group:'+data.groupId).emit('postQuiz',{
                    members : group.members,
                    score : score
                })
            })
        })
        
    })
    
    socket.on('awardPoint', function(data){
    
        console.log('Awarding point to user');
        // models.User.findByIdAndUpdate(data.userId, { $inc : { teachingPoints : 1 }},
        // {new : true }, function (user){
        //     console.log('Teaching points for user '+data.userId+' now '+user.teachingPoints);
        // })
    })
    
    
})
//////////////// -------------


// start server
http.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});