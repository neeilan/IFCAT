//
$('#driverSelect').hide();
$('#activeQuiz').hide();
$('.quizBtn').attr('disabled', true); // Disable quiz buttons (enable if assigned as driver)
//
var url = window.location.href;
var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));
var socket = io();
var quizData, groupId, currentQuestionId;
    
socket.emit('requestQuiz', quizId);

socket.on('quizData', function(data){
  quizData = data.quiz;
  groupId = data.groupId;
  $('#groupName').html(data.groupName);
})

socket.on('quizActivated', function(data){
  console.log('quiz activated')
  $('#driverSelect').show();
  $('#selectDriverBtn').click(function(){
    emit('nominateSelfAsDriver');
  })
})

socket.on('startQuiz', function(data){
  $('#driverSelect').hide();
  $('#activeQuiz').show();
    if (quizData)
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
  renderQuestion(quizData.quiz, data.questionNumber);
})

socket.on('updateAttempts', function(data){
    $('#currentAttempts').html(data.attempts);
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
  
  if (n >= quiz.questions.length){
    quizCompleted();
    return;
  }
  
  $('#submitQuestion').off('click');
    
  currentQuestionId = quiz.questions[n]._id;
  
  // reset attempt number
  $('#currentAttempts').html('0');
  
  // renders nth question (0 indexed) in quiz
  $("#text").html(quiz.questions[n].question);
  $("#choices").html("");
  
  if (quiz.questions[n].files){
    var file = quiz.questions[n].files[0];
    if (file && file.type.includes('image')){
      var courseId = url.slice(url.indexOf('/courses/') + 9, url.indexOf('/quizzes'));
      var fileUrl = '/upl/' + courseId + '/' + file.name;
      $('#text').append('<br/><img class="attachedImg" src="' + fileUrl + '"/> <br/>')

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
        next: n+1
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
    