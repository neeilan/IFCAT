var socket = io();

var quiz = {
  name : 'Quiz 1',
  questions: [ { text: 'Favourite color?', correctAnswers : ['red'],
                choices: ['blue', 'red', 'green', 'purple', 'orange'] },
              { text: 'Favourite answer', correctAnswers : ['correct'],
                choices: ['wrong', 'correct'] },
              ],
  randomizeChoices: false,
  scoreByAttempt : [5,4,3,2,1]
}

 
var score = 0;
renderQuestion(quiz, 0);
  
function renderQuestion(quiz, n){
    
    var attemptNumber = 1;
    
    // reset attempt number
    $('#currentAttempts').html(attemptNumber);
    
    // renders nth question (0 indexed) in quiz
    $("#text").html(quiz.questions[n].text);
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
      $('.currentlyChosen').removeClass('currentlyChosen');
      
      if (isCorrect){
        if (attemptNumber < 5){
          // Increment score if they did it withinn 5 attempts
          // can push actual response and # attempts to an array here
          // to build a response/groupResponse document
          score += quiz.scoreByAttempt[attemptNumber-1];
        }
    
        if (quiz.questions.length-1 > n){
          // Got it right - move on to next question
          renderQuestion(quiz, ++n);
        }
        else {
          // Quiz is done - you got the question right
          $("#activeQuiz").html('Quiz complete! Your score: '+score);
        }
    
      }
      else {
        // just got the question wrong
        $('#currentAttempts').html(++attemptNumber);
      }
      
      })
}

function mark(questionNumber, answer){
// returns true iff answer is a correct answer to question (questionNumber + 1)
  return (quiz.questions[questionNumber].correctAnswers.indexOf(answer) > -1)
 }
    