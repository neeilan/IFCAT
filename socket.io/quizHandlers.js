var models = require('../models'),
    _ = require('lodash');

module.exports = function(io){
    
    
    
    return function (socket){   
        var emitters = require('./emitters')(io);
    if (socket.request.user && socket.request.user.logged_in) {
        console.log('authenticated socket');
       /* We can push user-specific messages / notifications if need be. Only group-specific rooms used in version 1.
       socket.join('user:' + socket.request.user._id); // Since a user can connect from multiple devices/ports, use socket.io rooms instead of hashmap
        */
        var referringUrl = socket.request.headers.referrer;
        
    }
    else{
        socket.disconnect();
    }
    
    socket.on('REQUEST_QUIZ', function(tutQuizId){
        models.TutorialQuiz.findById(tutQuizId)
        .populate([{
            path : 'quiz',
            model : 'Quiz',
            populate : {
                path : 'questions',
                model : 'Question',
                select : '-answers',
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

            var studentsGroup, studentsGroupId = null;
            
            // Socket room for all students in this tutorial taking this quiz
            socket.join('tutorialQuiz:' + tutQuiz._id);
            
            // if student already in a group, add them to approriate socket.io room
            tutQuiz.groups.forEach(function(group){
                if (group.members.indexOf(socket.request.user._id) > -1) {
                    socket.join('group:'+group._id);
                    console.log('Joined enrolled group ', group.name);
                    studentsGroup = group.name;
                    studentsGroupId = group._id;
                    socket.emit('quizData', { userId : socket.request.user._id, quiz : tutQuiz, groupName : studentsGroup, groupId: group._id} );
                }
            })
            
            if (studentsGroup) return studentsGroupId;
            else if (tutQuiz.active) {
                socket.emit('info', { message : 'You cannot join a group while the quiz is active. Please talk to your TA.' });
                return; // don't allow new group joining if a quiz is active
            }

            // student doesn't already have a group - need to add them to one if selection automatic. Otherwise send them list of groups to pick from.
            if (tutQuiz.allocateMembers == 'self-selection'){
                socket.emit('quizData', { userId : socket.request.user._id, quiz : tutQuiz } );
                return;
            }
            
            
            var groupsWithRoom = tutQuiz.groups.filter(function(group){
                if (!tutQuiz.max || !tutQuiz.max.membersPerGroup){
                    tutQuiz.max = { membersPerGroup : 2 }   // MAKE THIS DEFAULT BEHAVIOR IN SCHEMA
                }
                return (group.members.length < tutQuiz.max.membersPerGroup);
            })
            
            // if there's already a group with room, we can put the student there
            if (groupsWithRoom.length > 0) {
                // there is a group with room, let's add the student to it
                models.Group.findByIdAndUpdate(groupsWithRoom[0]._id, { $push : { members : socket.request.user._id } }, { new : true }, function (err,doc){
                    if (err) throw err;
                    console.log('Joining existing group ', groupsWithRoom[0]._id);
                 
                    socket.join('group:' + groupsWithRoom[0]._id);
                    socket.emit('quizData', { userId : socket.request.user._id, quiz : tutQuiz, groupName : groupsWithRoom[0].name, groupId: groupsWithRoom[0]._id} );
                    return;
                });
                
            }
            
            // if all existing groups are full, make a new group for the student
            else {
                // there are no groups with room - let's make a new group
                var group = new models.Group();
                group.name = (tutQuiz.groups.length + 1).toString();
                group.members = [ socket.request.user._id ];
                group.save( function(err, group){
                    if (err) console.log (err);
                     // we also need to add the group to this tutorialQuiz
                     models.TutorialQuiz.update({ _id : tutQuiz._id }, { $push : { groups :  group._id } }, { new : true }, function(err, doc){
                        if (err) throw err;
                     console.log('Created and joined a new group ', group.name);
                     socket.join('group:'+ group._id);
                     socket.emit('quizData', { userId : socket.request.user._id, quiz : tutQuiz, groupName : group.name, groupId: group._id } );
                     return;
                     })
                     
                });
            }
        })
        .then(function(groupId){
            if (!groupId) return;
            models.Response.find({ group : groupId })
            .exec()
            .then(function(responses){
                emitters.emitToGroup(groupId, 'updateScores', {
                    quizId: tutQuizId,
                    responses: responses,
                    groupId : groupId
                })
            })
        })
    })
    
    
    socket.on('NOMINATE_SELF_AS_DRIVER', function(data){
        models.Group.findById(data.groupId)
        .exec()
        .then(function(group){
            if (!group.driver || group.driver == socket.request.user)
                return models.Group.findByIdAndUpdate(data.groupId, { driver : socket.request.user })
                .exec()
        })
        .then(function(){
            emitters.emitToGroup(data.groupId, 'resetDriver', { groupId : data.groupId });
            socket.emit('assignedAsDriver', { groupId : data.groupId } );
            emitters.emitToGroup(data.groupId, 'startQuiz', {});
        })
    })

    function buildCodeTracingAnswerSummary(question, existingResponseObject, answer) {
        existingResponseObject = existingResponseObject || { lineByLineSummary : [] };
        var lineByLineSummary = [];
        for (var i = 0; i < answer.length; i++) {
            var existingAnswer = existingResponseObject.lineByLineSummary[i];
            if (answer[i].trim() != question.answers[i].trim()) {
                lineByLineSummary.push({
                    attempts :  (existingAnswer) ? existingAnswer.attempts + 1 : 1,
                    correct : false
                }); 
                if (lineByLineSummary[i].attempts == question.maxAttemptsPerLine) {
                    lineByLineSummary[i].correct = true;
                }   
            } else {
                lineByLineSummary.push({
                    attempts :  existingAnswer ? existingAnswer.attempts + (existingAnswer.correct ? 0 : 1) : 1,
                    correct : true
                });
            }
        }
        return lineByLineSummary;
    }

    function calculateCTQPoints(lineByLineSummary, question) {

        var points = 0;
        var totalAttempts = 0;
        lineByLineSummary.forEach(function(line){
            if (line.correct) {
                points += Math.max(0, question.penalty * (2 - line.attempts));
                totalAttempts += line.attempts;
            }
        });
        if (totalAttempts == lineByLineSummary.length)
            points += question.firstTryBonus;
        return points;
    }

    function calculateMaxPoints(question) {
        return question.points + question.firstTryBonus;
    }
            
    socket.on('CODE_TRACING_ANSWER_ATTEMPT', function(data){
        models.Question.findById(data.questionId)
        .exec()
        .then(function(question) {
            models.Response.findOne({ group : data.groupId, question: data.questionId })
            .exec()
            .then(function(response){

                var lineByLineSummary = buildCodeTracingAnswerSummary(question, response, data.answer);
                var numLinesCorrect = lineByLineSummary.reduce((acc, curr) => (acc + (curr.correct ? 1 : 0)), 0);
                var questionComplete = (numLinesCorrect == question.answers.length);
                var revealedLines = question.answers.slice(0, numLinesCorrect);


                if (!response) {
                    response =  new models.Response();
                    response.group = data.groupId;
                    response.question = data.questionId;
                }
                response.lineByLineSummary = lineByLineSummary;
                response.correct = questionComplete;
                response.codeTracingAnswers = revealedLines;
                response.points = questionComplete ? calculateCTQPoints(lineByLineSummary, question) : calculateMaxPoints(question);
                return response.save();                      

            })
            .then(function(response) {
                console.log('saved');
                console.log(response);
                emitters.emitToGroup(data.groupId, 'SYNC_RESPONSE', {
                    response: response,
                    questionId: data.questionId,
                    groupId : data.groupId
                })

                // if (response.codeTracingAnswers.length != question.answers.length)
                //     return;

                // return models.Response.find({ group : data.groupId })
                // .exec()
                // .then(function(responses){
                //     emitters.emitToGroup(data.groupId, 'updateScores', {
                //         responses: responses,
                //         groupId : data.groupId
                //     })
                // })
            })
            .catch(function(err){
                console.log('err');
                console.log(err);
            })
        })
    });
    
    socket.on('attemptAnswer', function(data){
        models.Question.findById(data.questionId)
        .exec()
        .then(function(question){
            var answerIsCorrect;
            
            answerIsCorrect = (question.answers.indexOf(data.answer[0]) != -1); // mark
            
            if (question.type == 'multiple select'){
                answerIsCorrect = false;
                if (data.answer.length == question.answers.length){
                    answerIsCorrect = true;
                    data.answer.forEach((ans)=>{ if (question.answers.indexOf(ans)==-1) answerIsCorrect = false; })
                }
            }
            else if (question.isShortAnswer()){
                if (!question.caseSensitive){
                    var answer = data.answer[0].toLowerCase();
                    var correctAnswers = question.answers.map(ans => ans.toLowerCase())
                    answerIsCorrect = (correctAnswers.indexOf(answer) > -1);
                }
                else{
                    answerIsCorrect = (question.answers.indexOf(data.answer[0]) > -1);
                }
            }
            
            models.Response.findOne({ group : data.groupId, question: data.questionId })
            .exec()
            .then(function(response){
                if (!response){
                    var res = new models.Response();
                    res.group = data.groupId;
                    res.question = data.questionId;
                    res.correct = answerIsCorrect;
                    res.attempts = answerIsCorrect ? 0 : 1;
                    res.points = answerIsCorrect ? (question.points + question.firstTryBonus) : 0;
                    return models.TutorialQuiz.findByIdAndUpdate(data.quizId, {
                        $push : { responses : res._id }
                    })
                    .exec()
                    .then(function(){
                        return res.save()
                    })
                }
                else{
                    // Some logic to prevent students from being dumb and reanswering correct questions and losing points
                    // Basically, if they get it right once, they can't worsen their score
                    
                    var attemptsInc = (response.correct) ? 0 : (answerIsCorrect) ? 0 : 1 ;
                    var newScore = (response.correct) ? response.points : (answerIsCorrect) ? (question.points - (response.attempts * question.penalty)) : 0;
                    // If they got it correct before, don't increment
                    
                    return models.Response.findByIdAndUpdate(response._id,
                    { correct: (response.correct || answerIsCorrect) , $inc : { attempts : attemptsInc },
                    points : (newScore > 0) ? newScore : 0 },
                    { new : true } )
                    .exec()
                }
            })
            .then(function(response){
                emitters.emitToGroup(data.groupId, 'groupAttempt', {
                    response: response,
                    questionNumber: data.questionNumber,
                    groupId : data.groupId
                })
            })           
            
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
                emitters.emitToGroup(data.groupId, 'postQuiz',{
                    members : group.members,
                    score : score,
                    groupId : data.groupId
                })
            })
        })
        
    })
    
    socket.on('awardPoint', function(data){
        models.Group.findByIdAndUpdate(data.groupId,
        { $push : { teachingPoints : data.receiverId } },{new:true}, function(err, group){
            if (err) throw err;
            socket.emit('info', {message : 'Teaching points successfully awarded'});
        })
    })
    
    
    socket.on('joinGroup', function(data){
        models.TutorialQuiz.findById(data.quizId).exec()
        .then(function(tutQuiz){
            if (tutQuiz.max.membersPerGroup){
            models.Group.findById(data.newGroup).exec()
            .then(function(gr){
                if (gr.members.length >= tutQuiz.max.membersPerGroup){
                    socket.emit('info', {message : 'This group already has the maximum number of members for this activity'});
                    return false;
                }
                else return true;
            })
            .then(function(proceed){
                if (!proceed) return;
               models.Group.update({ _id : { $in :  tutQuiz.groups } }, { $pull : { members : socket.request.user._id } }, { multi : true} ) // make sure user isn't in 2 groups
                .exec()
                .then(function(){
                  return models.Group.findByIdAndUpdate(data.newGroup, { $push : { members : socket.request.user._id } }, { new : true } ).exec() // add new group to TutQuiz 
                })
                .then(function(group){
                    console.log('here2')
                    models.TutorialQuiz.findById(data.quizId).populate('groups').exec()
                    .then(function(populatedTQ){
                        socket.join('group:'+ data.newGroup);
                        socket.emit('setGroup', data.newGroup)
                        socket.emit('info', {message : 'Joined Group ' + group.name });
                        emitters.emitToTutorialQuiz(tutQuiz._id, 'groupsUpdated', { groups : populatedTQ.groups })
                        socket.emit('quizData', { userId : socket.request.user._id, quiz : populatedTQ, groupName : group.name, groupId: group._id });
                    })
    
                })
            })
            }
        })
    })
    
    socket.on('createGroup', function(data){
        models.TutorialQuiz.findById(data.quizId).exec()
        .then(function(tutQuiz){
            
            var group = new models.Group();
            group.name = (tutQuiz.groups.length + 1).toString();
            group.members = [ socket.request.user._id ];
            group.save( function(err, group) {
                if (err) console.log (err);
                    
                models.Group.update({ _id : { $in :  tutQuiz.groups } }, { $pull : { members : socket.request.user._id } }, { multi : true },
                function(err, doc){
                    console.log(doc);
                  models.TutorialQuiz.findByIdAndUpdate(data.quizId, { $push : { groups : group._id } })
                  .exec() // add new group to TutQuiz 
                .then(function(tq){
                    return models.TutorialQuiz.findById(tq._id).populate('groups').exec();
                })
                .then(function(populatedTQ){
                    socket.join('group:'+ group._id);
                    socket.emit('info', {message : 'Created and joined Group ' + group.name });
                    emitters.emitToTutorialQuiz(tutQuiz._id, 'groupsUpdated', { groups : populatedTQ.groups })
                    socket.emit('quizData', { userId : socket.request.user._id, quiz : populatedTQ, groupName : group.name, groupId: group._id });
                })
                    
                }) // make sure user isn't in 2 groups
            });
        })
        
    })
    }
    
}