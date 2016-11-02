$('.quizBtn').attr('disabled', true); // Disable quiz buttons (enable if assigned as driver)
//
var url = window.location.href;
var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));
var socket = io();
var quizData, userId, groupId, isDriver,  responses = {}, currentQuestionId, currentQuestionIndex, score = 0;
    
socket.emit('requestQuiz', quizId);
socket.on('setGroup', function(id){
    console.log('setGroup');
    groupId = id;
})

socket.on('quizData', function(tutorialQuiz){
  console.log('quizData');
  console.log(tutorialQuiz);
  quizData = quizData || tutorialQuiz.quiz;
  groupId = tutorialQuiz.groupId;
  userId = userId || tutorialQuiz.userId;
  
   if (tutorialQuiz.groupName){
      $('#groupName').html(tutorialQuiz.groupName);
      $('#currentGroup').html(tutorialQuiz.groupName);
   }
   if (quizData.allocateMembers == 'self-selection') {
      renderGroups(tutorialQuiz.quiz.groups);
    }
  
  if (quizData.active){
        $('#groupSelfSelect').hide();
        $('#driverSelect').show();  
  }
  
})

socket.on('groupsUpdated', function(data){
    console.log('groupsUpdated');
    renderGroups(data.groups);
})



// When a question is answered by leader, a 'groupAttempt' event is emitted
socket.on('groupAttempt', function(data){
  console.log('groupAttempt');
  if (groupId && data.groupId != groupId) return;

  responses[data.response.question] = data.response;
  if (data.response.group != groupId) return;
  var question = quizData.quiz.questions[data.questionNumber-1];
  var maxScore = question.firstTryBonus + question.points;
  
  if (data.response.correct) {
    swal("Good job!", "Question "+ data.questionNumber + " was answered correctly!\
     Received " + data.response.points + " of " + maxScore + " points ", "success");
     score += parseInt(data.response.points);
     $('#'+(data.questionNumber-1)).addClass('btn-success');
  }
  else {
    swal("Yikes!", "Question "+ data.questionNumber +" was answered incorrectly!", "error");
    
    var scoreData = calculateStars(question);
    if (scoreData.correct) { $('#'+i).addClass('btn-success'); }
    renderStars(data.questionNumber - 1, scoreData.emptyStars, scoreData.fullStars);
    renderQuestionScoreMobile(data.questionNumber-1);

  }
  
  renderQuestion(quizData.quiz, currentQuestionIndex);
  $('#currentScore').html(score);
  
})

socket.on('resetDriver', function(data){
  console.log('resetDriver');
  if (groupId != data.groupId) return;
  $('.quizBtn').attr('disabled', true);
  isDriver = false;
  renderQuestion(currentQuestionIndex);
})
    


// Driver controls
$(document).on('click', '#selectDriverBtn', function(){
  emit('nominateSelfAsDriver');
})
$(document).on('click', '#deferDriverBtn', function(){
  if (quizData.active){
    renderQuestion(quizData.quiz, 0);
  }
})

// Group creation
$(document).on('click','#createGroupBtn', function(){
    emit('createGroup');
})

function renderStars(question, empty, full, returnHTML){
    var fullStars = "<i class = 'fa fa-star' />&nbsp;".repeat(full),
      emptyStars = "<i class = 'fa fa-star-o' />&nbsp;".repeat(empty);
    var html = emptyStars + fullStars;
    
    if (parseInt(empty) + parseInt(full) > 6){
      html = "Stars: "+(full)+"/" + (empty+full);
    }
    if (returnHTML) return html;
    $('#points-'+question).html(html);
}


socket.on('quizActivated', function(tutQuiz){ // active = start questions]
  console.log('quizActivated');
  quizData.active = tutQuiz.active;
  $('#groupSelfSelect').hide();
  console.log(tutQuiz.active)
  if (tutQuiz.active){
    $('#postQuiz').hide();
    swal('','The quiz is now active. Select a driver and proceed','info')
    $('#driverSelect').show();
  }
  else{
    quizCompleted();
  }
})

socket.on('startQuiz', function(data){
    console.log('startQuiz');
    if (quizData.active){
      swal('Your group now has a driver!', 'Note that any previous driver no longer has answering privileges', 'info');
      renderQuestion(quizData.quiz, 0);
    }
})

socket.on('updateScores', function(data){
  console.log('updateScores');
  if (groupId && data.groupId != groupId) return;

  data.responses.forEach(function(response, i){
    responses[response.question] = response;
  })
  if (data.responses.length){
  score = data.responses.reduce(function(prev, curr){
    if (isNaN(prev)){
      return prev.points + curr.points;
    }
    return prev + curr.points;
  })
  }
})

socket.on('assignedAsDriver', function(data){
  console.log('assignedAsDriver');
  if (groupId && data.groupId != groupId) return;
  /*
  Emitted to the user assigned as a driver.
  Todo: When previous driver disconnects, assign next driver automatically
  */
  // enable choices and submit buttons (disabled by default)
  isDriver = true;
  $('.quizBtn').attr('disabled', false);
})


function renderGroups(groups, currentGroupId){
    console.log(userId)
    $('#groupSelfSelect').show();
    var html = '';
    groups.forEach(function(group){
        
        var btnClass = group.members.includes(userId) ? 'btn-success' : 'btn-default' ;
        html+= '<br/><a class="btn '+ btnClass+' joinGroup" id="'+ group._id +'">Group ' + group.name + '\t(Members: '+ group.members.length +')</a>'
    })
    $('#groupsList').html(html); 
    $('.joinGroup').click(function(e){
        console.log(e.target.id)
        emit('joinGroup', { newGroup : e.target.id });
    })
}


function emit(eventName, data) {
  /* Acts as wrapper for emitting events, attaching
   useful "header" properties */
   if (!data) {
     var data = {}
   }
  data.groupId = groupId;
  data.quizId = quizData._id;
  socket.emit(eventName, data);
}
 
var score = 0,
    currentQuizId = null;

// console.log(sessionStorage.getItem('currentQuiz'));
  
function renderQuestion(quiz, n){
  $('.quizBtn').attr('disabled', !isDriver);
  $('#driverSelect').hide();
  $('#assignGroup').hide();
  $('#activeQuiz').show();
  $('#currentScore').html(score || 0);
  

  
  
  if (n >= quiz.questions.length){
    quizCompleted();
    return;
  }

  
  $('#submitQuestion').off('click');
    
  currentQuestionId = quiz.questions[n]._id;
  currentQuestionIndex = n;
  
  
  // renders nth question (0 indexed) in quiz
  $("#text").html(quiz.questions[n].number + ". " + quiz.questions[n].question);
  $("#choices").html("");
  
  
  // Attachments (files and links)
  $('#attachment').html('');
  $('#attachmentCollapser').show();
  if (quiz.questions[n].files.length || quiz.questions[n].links.length){
        quiz.questions[n].files.forEach(function(file){
          var courseId = url.slice(url.indexOf('/courses/') + 9, url.indexOf('/quizzes'));
          var fileUrl = '/upl/' + courseId + '/' + file.name;
          if (file.type.includes('image')){
            $('#attachment').append('<img class="attachedImg" src="' + fileUrl + '"/> <br/>\
            <a target = "_blank" href="'+fileUrl+'"> Direct link</a><br/>')
          }
          else if (file.type.includes('audio')){
            $('#attachment').append('<br/><audio controls>\
              <source src="'+ fileUrl +'" type="'+ file.type +'">\
              Your browser does not support the audio element.\
              </audio><br/>\
              <a target = "_blank" href="'+fileUrl+'"> Direct link</a><br/>')
          }
          else {
            $('#attachment').append('<br/><a target = "_blank" href = "'+ fileUrl +'">'+ file.name + '</a><br/>')
          }
        })
        
      quiz.questions[n].links.forEach(function(link){
          $("#attachment").append('<br/><a target = "_blank" href = "'+ link +'">'+ link + '</a><br/>');
      })
  }
  else{
      $('#attachmentCollapser').hide();
  }
  
  
  // shuffle choices if need be
  var choices = quiz.questions[n].choices || [];
  var shuffledChoices = (quiz.questions[n].shuffleChoices) ? _.shuffle(quiz.questions[n].choices) : choices;

  // render choices
  if (quiz.questions[n].type == 'short answer'){
      $('#choices').append('<input type="text" class="form-control" placeholder="Enter your answer here" id="textInput"></input><br/>');
  }
  else{
      $.each(shuffledChoices, function(i, choice){
          var index = choices.indexOf(shuffledChoices[i]);
        $("#choices").append("<div class = 'quizBtn choice' id='choice:" + index + "' >" + choice + "</div>")
      })   
      $(".choice").click(function(e){
        if ($(e.target).hasClass('currentlyChosen')){
          setTimeout(function(){
            $(e.target).removeClass('currentlyChosen'); // only works with setTimeout for some reason lol
          }, 50);
        }
        if (quiz.questions[n].type != 'multiple select'){
          $('.currentlyChosen').removeClass('currentlyChosen');
        }
    
        $(e.target).addClass('currentlyChosen');
    })
  }

  // LATEX logic
  if(quiz.questions[n].useLaTeX){
    $("#activeQuiz").addClass("tex2jax_process");
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
  else{
    $("#activateQuiz").removeClass("tex2jax_process");
  }
  
    $("#submitQuestion").click(function(e){
      var currentlyChosen = $('.currentlyChosen');
      var textAnswer = $('#textInput').val();
      if (currentlyChosen.length === 0 && textAnswer.length === 0){
          console.log('returning')
        return;
      }

    // We're sending back an array of selected choices for marking for flexibility
    
    var chosenAnswer = [];
    $.each(currentlyChosen, function(i,element){
      var chosenAnswerIndex = $(element).attr('id').substring(7);
      chosenAnswer.push( quizData.quiz.questions[n].choices[chosenAnswerIndex] );
    })

      $('.currentlyChosen').removeClass('currentlyChosen');
      
      emit('attemptAnswer', {
        questionId : quiz.questions[n]._id,
        answer : textAnswer ? [textAnswer] : chosenAnswer,
        questionNumber : parseInt(n)+1
      })      
      
    })
    
  // questions list and score display
  renderQuestionScoreMobile(n);
  if($('#questionSelect').html().length == 0){ // at start or after refresh
    quiz.questions.forEach(function(question, i){
      
      var className = (i == n) ? 'btn-warning' : '';
      $('#questionSelect').append('<button id = "'+ i + '" class = "goToQuestion col-md-12 col-xs-2 col-sm-2 btn '+ className +'">'
      + quiz.questions[i].number
      + '<br/><div class = "questionPoints" id = "points-'+ i +'">'
      +'</div>'
      + '</button>');
      
      $(document).on('click', '.goToQuestion', function(e){
        renderQuestion(quiz, e.target.id );
      })
      
      var scoreData = calculateStars(question);
      if (scoreData.correct) { 
        $('#'+i).addClass('btn-success');
      }
      renderStars(i, scoreData.emptyStars, scoreData.fullStars);
    })
  } else {
    $('.goToQuestion').removeClass('btn-warning');
    $('#'+n).addClass('btn-warning');
  }
  


  
  
  // Check for previously answered questions
  if (quiz.questions[n]._id in responses && responses[quiz.questions[n]._id].correct){
    $('.quizBtn').attr('disabled', true);
    $('#choices').append('<br/><div class = "alert alert-success"> You have correctly answered this question already</div>')
  }
  
  
  
}
 
 function quizCompleted (){
   if (quizData.active){
    $('#activeQuiz').html('Your responses have been submitted.\
    You can change answers (penalties may apply) until your TA inactivates this quiz.');
   }
   else{
     $('#postQuiz').show();
     socket.emit('quizComplete', { groupId: groupId, quizId: quizData._id })
   }
 }
 
function renderQuestionScoreMobile(questionIndex){
  var question = quizData.quiz.questions[questionIndex];
  var scoreData = calculateStars(question);
  var html = renderStars(questionIndex, scoreData.emptyStars, scoreData.fullStars, true);
  $("#questionScore").html(html);
 }
 
function calculateStars(question){
  var result = {};
  
  var maxScore = question.points + question.firstTryBonus;
  
  if (question._id in responses){
    result.correct = responses[question._id].correct;
    var emptyStars = (responses[question._id].attempts == 0) ? 0 : responses[question._id].attempts * question.penalty + question.firstTryBonus;
    result.emptyStars = emptyStars > maxScore ? maxScore : emptyStars;
    result.fullStars = maxScore - emptyStars > 0 ? (maxScore - emptyStars) : 0;
  }
  else{
    result.emptyStars = 0;
    result.fullStars = maxScore;
  }
  return result;
}

    
socket.on('postQuiz', function(data){
  console.log('postQuiz');
  if (groupId && data.groupId != groupId) return;
  
  $(".preQuiz").hide();
  $('#activeQuiz').hide();
  $("#postQuiz").show();
  $('#score').html(score);
  var html = "";
  data.members.forEach(function(member){
    html+="<br/><button class='teachingPt btn btn-default col-md-6 col-xs-8 col-sm-8 col-md-offset-3 col-sm-offset-2 col-xs-offset-2 ' id='"+ member._id +"'>" + (member.name.first+' '
    +member.name.last) +"</button><br/>"
  })
  $("#teachingPointsPicker").html(html);
  $(document).on('click','.teachingPt', function(e){
    emit('awardPoint', { receiverId : e.target.id });
    $('#postQuiz').html('Quiz complete');
  })
})

socket.on('info', function(data){
  console.log('info');
  console.log(data);
  swal('', data.message, 'info');
})