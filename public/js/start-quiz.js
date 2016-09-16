//
$('#driverSelect').hide();
$('#activeQuiz').hide();
//

var socket = io();

var quizId = $('#quizId').html(), // get from url in full app
    quizData = null;
    
socket.emit('requestQuiz', quizId);

socket.on('quizData', function(quiz){
  quizData = quiz;
  $('#driverSelect').show()
  
  $('#selectDriverBtn').click(function(){
    socket.emit('selectedAsDriver');
  })
})

socket.on('startQuiz', function(){
  $('#driverSelect').hide();
  $('#activeQuiz').show();
    if (quizData)
        renderQuestion(quizData.quiz, 0);
})

socket.on('renderQuestion', function(n){
  console.log('renderQuestion: ', n);
  renderQuestion(quizData.quiz, n);
})

socket.on('updateScores', function(scores){
    $('#score').html(scores.score);
    $('#currentAttempts').html(scores.attemptNumber);

})

function showQuestionToGroup(n){
  socket.emit('showQuestionToGroup', n); //  experimenting with wrappers
  
}


// var quiz = {
//   _id: 'hihihi',
//   name : 'Quiz 1',
//   questions: [ { question: 'Favourite color?', correctAnswers : ['red'],
//                 choices: ['blue', 'red', 'green', 'purple', 'orange'] },
//               { question: 'Favourite answer', correctAnswers : ['correct'],
//                 choices: ['wrong', 'correct'] },
//               ],
//   randomizeChoices: false,
//   scoreByAttempt : [5,4,3,2,1]
// }



 
var score = 0,
    currentQuizId = null;

// console.log(sessionStorage.getItem('currentQuiz'));
  
function renderQuestion(quiz, n){
  
  if (n >= quiz.questions.length){
    quizCompleted();
    return;
  }
    
    var attemptNumber = 1;
    
    // update score
    
    // reset attempt number
    $('#currentAttempts').html(attemptNumber);
    
    // renders nth question (0 indexed) in quiz
    $("#text").html(quiz.questions[n].question);
    $("#choices").html("");
    
    // shuffle choices if need be
    // var choices = quiz.randomizeChoices ? _.shuffle(quiz.questions[n].choices) : quiz.questions[n].choices
    var choices = quiz.questions[n].choices

    // render choices
    $.each(choices, function(i, choice){
      $("#choices").append("<div class = 'choice'>"+ choice +"</div>")
    })
    
    $(".choice").click(function(e){
      $('.currentlyChosen').removeClass('currentlyChosen');
      $(e.target).addClass('currentlyChosen')
     })
    
    $("#next").click(function(e){
      var currentlyChosen = $('.currentlyChosen');
      if (currentlyChosen.length){
        var chosenAnswer = currentlyChosen[0].textContent;
      }
      console.log(chosenAnswer);
      var isCorrect = mark(n, chosenAnswer);
      console.log(isCorrect);
      $('.currentlyChosen').removeClass('currentlyChosen');
      
      if (isCorrect){
        if (attemptNumber < 5){
          // Increment score if they did it withinn 5 attempts
          // can push actual response and # attempts to an array here
          // to build a response/groupResponse document
           score +=  1;
        //or   quiz.scoreByAttempt ? quiz.scoreByAttempt[attemptNumber-1] ||
        }
        
        // Move onto next question
        showQuestionToGroup(++n);
      }
      else {
        // just got the question wrong
        $('#currentAttempts').html(++attemptNumber);
      }
      
      // update score
      socket.emit('propagateScoresToGroup', { score : score , attemptNumber : attemptNumber } )

      })
}

function mark(questionNumber, answer){
// returns true iff answer is a correct answer to question (questionNumber + 1)
  var index = quizData.quiz.questions[questionNumber].choices.indexOf(answer);
  console.log(index)
  return (quizData.quiz.questions[questionNumber].answers.indexOf(index) > -1)
 }
 
 function quizCompleted (){
  $('#activeQuiz').html('The quiz has been completed.')  
 }
 
 // Socket.io handlers
 
 socket.on('goToQuestion', function(data){
     if (data.quizId === currentQuizId) {
         renderQuestion(quiz, data.questionNumber)
     }
 })
    