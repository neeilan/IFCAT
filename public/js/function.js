$(function () {
    var $selectQuestion = $('#select-question'),
        $prevQuestion = $('#prev-question'),
        $checkAnswer = $('#check-answer'),
        $nextQuestion = $('#next-question');

    var urls = {
        selectQuestion: $('#select-question-url').val(),
        prevQuestion: $().val(),
        checkAnswer: $('#check-answer-url').val(),
        nextQuestion: $('#next-question-url').val()
    };

    // templates[res.question.type]

    $(document).on('click', '.btn-select-question', function (e) {
        e.preventDefault();
        $.post(urls.selectQuestion, { id: $(this).data('id') }, loadQuestion);
    });

    $(document).on('click', '#btn-prev-question', function (e) {
        e.preventDefault();
        // emit socket event
        // load view
    });

    $(document).on('click', '#btn-next-question', function (e) {
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

    $(document).on('click', '#btn-next-question', function (e) {
        e.preventDefault();
        // emit socket event
        // load view
    });
});