$(function () {
    var body = $(document.body);

    if (body.hasClass('tutorial-quiz-page')) {
        var tbody = $('tbody');
        // create buttons
        tbody.buttonCircle();
        // create buttons for next group
        $('.btn-add').click(function () {
            var n = getNextGroup();
            tbody.find('.btn-circle:last-child').each(function () {
                var tpl = $(this),
                    btn = tpl.clone(),
                    label = btn.find('label'),
                    input = btn.find('input');
                btn.removeClass('active');
                label.text(n);
                input.attr({ value: n, 'data-label': n }).prop('disabled', false);
                tpl.before(btn);
            });
        });
        // update groups
        $('.btn-save').click(function (e) {
            e.preventDefault();
            var btn = $(this), form = btn.closest('form');
            form.attr('action', btn.attr('href')).submit();
        });
        // find next group number
        function getNextGroup () {
            var used = tbody.find('input').map(function () {
                return parseInt(this.dataset.label, 10) || -1;
            }).get().sort();
            // find first unused number
            var n = 1;
            while (used.indexOf(n) > -1) n++;
            return n;
        }
    }
});