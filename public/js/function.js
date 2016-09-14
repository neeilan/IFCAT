$(function () {
    var $selectQuestion = $('#select-question'),
        $prevQuestion = $('#prev-question'),
        $checkAnswer = $('#check-answer'),
        $nextQuestion = $('#next-question');

    var urls = {
        selectQuestion: $('#select-question-url').val(),
        prevQuestion: $('#prev-question-url').val(),
        checkAnswer: $('#check-answer-url').val(),
        nextQuestion: $('#next-question-url').val()
    };

    var templates = {
        'multiple choice': _.template($('#multiple-choice-template').text()),
        'true or false': _.template($('#true-or-false').text()),
        'multiple select': _.template($('#multiple-select').text())
    };

    // templates[res.question.type]

    var loadQuestion = function (res) {
        // update question 

        $('').text(res.question.question);
        // update files
        $('').html(
            res.question.files.map(function (file) {
                return templates[res.question.file.type]({

                });
            }).join('')
        );
        // update answers
        $('').html(
            res.question.answers.map(function (answer) {
                return templates[res.question.type]({

                });
            }).join('')
        );

    };

    $selectQuestion.click(function (e) {
        e.preventDefault();
        $.post(urls.selectQuestion, { id: $(this).data('id') }, loadQuestion);
    });

    $prevQuestion.click(function (e) {
        e.preventDefault();
        $.post(urls.prevQuestion, loadQuestion);
    });

    $checkAnswer.click(function (e) {
        e.preventDefault();
        $.post(urls.checkAnswer, $(this).closest('form').serialize(), function (res) {
            // update # of attempts
            if (res.attempts) {

            }
            //
            if (res.status) {
                
            } else {

            }
        });
    });

    $nextQuestion.click(function (e) {
        e.preventDefault();
        $.post(urls.nextQuestion, loadQuestion);
    });
});