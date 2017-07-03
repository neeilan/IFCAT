$(function () {
    var body = $(document.body);
    if (body.hasClass('tutorial-quizzes')) {
        // update selected tutorial quizzes
        $('.nav-actions a:not(#btn-export)').click(function (e) {
            e.preventDefault();
            $.put(this.href, $(form).serialize(), function () {
                window.location.reload(true);
            });
        });
    }
    if (body.hasClass('tutorial-quiz')) {
        var tab = $('#groups'), table = $('table', tab), tr0 = $('tbody > tr:first-child', table);
        var nextNumber = function () {
            // get used numbers
            var used = $('.btn-circle > :checkbox', tr0).map(function () {
                return parseInt(this.dataset.label, 10) || -1;
            }).get().sort();
            // find first unused number
            var num = 1;
            while (used.indexOf(num) > -1) { num++ }
            return num;
        };
        // add new group to table
        $('.btn-add', tab).click(function () {
            var n = nextNumber();
            $('.btn-circle:last-child', table).each(function () {
                $(this).before(this.outerHTML.replace(/\?/g, n)); 
            });
        });
    }
});