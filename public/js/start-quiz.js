$('.quizBtn').attr('disabled', true); // Disable quiz buttons (enable if assigned as driver)
//
var url = window.location.href;
var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));
var socket = io();
var quizData, groupId, currentQuestionId;
    
socket.emit('requestQuiz', quizId);

socket.on('quizData', function(tutorialQuiz){
  quizData = tutorialQuiz.quiz;
  groupId = tutorialQuiz.groupId;
  $('#groupName').html(tutorialQuiz.groupName);
  
  if (quizData.active){
    $('#driverSelect').show();  
  }
})


$(document).on('click', '#selectDriverBtn', function(){
  emit('nominateSelfAsDriver');
})
$(document).on('click', '#deferDriverBtn', function(){
  if (quizData.active){
    renderQuestion(quizData.quiz, 0);
  }
})

function renderStars(empty, full){
    var fullStars = "<i class = 'fa fa-star' />".repeat( full ),
      emptyStars = "<i class = 'fa fa-star-o' />".repeat(  empty );
    var html = emptyStars + fullStars;
    $('#currentAttempts').html(html).show();
}



// socket.on('quizUnlocked', function(tutQuiz){ // unlocked = can select groups
//   if (tutQuiz.unlocked){
//     $('#driverSelect').show();
//     $('#selectDriverBtn').click(function(){
//       if (tutQuiz.unlocked && tutQuiz.active)
//         emit('nominateSelfAsDriver');
//       else {
//         alert('Please wait until your TA activates this quiz before you start answering questions')
//       }
//     })
//     $('#deferDriverBtn').click(function(){
//       // if (tutQuiz.active)
//       //   renderQuestion(quizData.quiz, 0);
//     })    
//   }
//   else{
//     $('#activateQuiz').html('The quiz is locked.');
//   }
// })


socket.on('quizActivated', function(tutQuiz){ // active = start questions
  quizData.active = tutQuiz.active;
  if (tutQuiz.active){
    alert('The quiz is now active. Select a driver and proceed!')
    $('#driverSelect').show();
  }
  else{
    $('#activeQuiz').html('The quiz is no longer active. Your responses have been saved.');
  }
})

socket.on('startQuiz', function(data){
    if (quizData.active)
        renderQuestion(quizData.quiz, 0);
})


socket.on('assignedAsDriver', function(){
  /*
  Emitted to the user assigned as a driver.
  Todo: When previous driver disconnects, assign next driver automatically
  */
  // enable choices and submit buttons (disabled by default)
  $('.quizBtn').attr('disabled', false);
})

socket.on('renderQuestion', function(data){
  console.log(quizData)
  renderQuestion(quizData.quiz, data.questionNumber);
  
})

socket.on('updateAttempts', function(data){
  if (quizData.quiz.questions.length - data.attempts >= 0)
    renderStars(data.attempts, quizData.quiz.questions.length - data.attempts)

})

function emit(eventName, data) {
  /* Acts as wrapper for emitting events, attaching
   useful "header" properties */
   if (!data) {
     var data = {}
   }
  data.groupId = groupId;
  socket.emit(eventName, data);
}
 
var score = 0,
    currentQuizId = null;

// console.log(sessionStorage.getItem('currentQuiz'));
  
function renderQuestion(quiz, n){
  
  $('#driverSelect').hide();
  $('#assignGroup').hide();
  $('#activeQuiz').show();
  $('#currentAttempts').hide();
  
  if (n >= quiz.questions.length){
    quizCompleted();
    return;
  }

  
  $('#submitQuestion').off('click');
    
  currentQuestionId = quiz.questions[n]._id;
  
  
  // renders nth question (0 indexed) in quiz
  $("#text").html(quiz.questions[n].question);
  $("#choices").html("");
  
  $('#attachment').html('');
  if (quiz.questions[n].files){
    var file = quiz.questions[n].files[0];
    if (file && file.type.includes('image')){
      var courseId = url.slice(url.indexOf('/courses/') + 9, url.indexOf('/quizzes'));
      var fileUrl = '/upl/' + courseId + '/' + file.name;
      $('#attachment').html('<img class="attachedImg" src="' + fileUrl + '"/> <br/><hr/>')

    }
  }
  
  // shuffle choices if need be
  // var choices = quiz.randomizeChoices ? _.shuffle(quiz.questions[n].choices) : quiz.questions[n].choices
  var choices = quiz.questions[n].choices

  // render choices
  $.each(choices, function(i, choice){
    $("#choices").append("<div class = 'quizBtn choice'>"+ choice +"</div>")
  })
  
  $(".choice").click(function(e){
    $('.currentlyChosen').removeClass('currentlyChosen');
    $(e.target).addClass('currentlyChosen');
   })
  
    $("#submitQuestion").click(function(e){
      
      var currentlyChosen = $('.currentlyChosen');
      
      if (currentlyChosen.length === 0){
        return;
      }

      var chosenAnswer = currentlyChosen[0].textContent;
      
      console.log(chosenAnswer);
      
      var isCorrect = mark(n, chosenAnswer);
      
      $('.currentlyChosen').removeClass('currentlyChosen');
      
      emit('attemptAnswer', {
        questionId : currentQuestionId,
        correct: isCorrect,
        next: parseInt(n) + 1
      })      
      
    })
    
  // questions list
  $('#questionSelect').html('');
  quiz.questions.forEach(function(question, i){
    var className = (i == n) ? 'btn-primary' : 'btn-default';
    $('#questionSelect').append('<button id = "'+ i + '" class = "goToQuestion col-md-11 col-xs-2 col-sm-2 btn '+ className +'">'+ (i+1) +'</button>');
    $(document).on('click', '.goToQuestion', function(e){
      renderQuestion(quiz, e.target.id )
    })
  })
  
}

function mark(questionNumber, answer){
  // returns true iff answer is a correct answer to question (questionNumber + 1)
  return (quizData.quiz.questions[questionNumber].answers.indexOf(answer) > -1)
 }
 
 function quizCompleted (){
  $('#activeQuiz').html('The quiz has been completed.')  
 }
 
 // Socket.io handlers
 
 socket.on('goToQuestion', function(data){
     if (data.quizId === currentQuizId) {
         renderQuestion(quizData.quiz, data.questionNumber)
     }
 })
    