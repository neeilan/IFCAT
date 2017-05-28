$(function () {
    if ($('body').hasClass('conduct-quiz')) {
        var tab = $('#groups'), 
            table = $('table', tab),
            tr = $('tbody > tr:first-child', table);
        var nextNumber = function () {
            var num = 1, used = tr.find('.btn-circle').map(function () { 
                return parseInt($(this).text(), 10) || -1;
            }).get().sort();
            // find first unused number
            while (used.indexOf(num) > -1) { num++ }
            return num;
        };
        // add new group to table
        $('.btn-add', tab).click(function () {
            var n = nextNumber();
            $('.btn-circle:last-child', table).each(function () {
                $(this).before(this.outerHTML.replace(/new/g, n)); 
            });
        });
    }
});