$(function () {
    var body = $(document.body);

    if (body.hasClass('tutorials-page')) {
        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = $(this), tr = btn.closest('tr'), form = tr.closest('form');
            $.deletebox({
                title: 'Delete tutorial',
                message: '<p>You are about to delete tutorial <b>' + tr.find('.number').text() + '</b> and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    btn.closest('form').attr('action', btn.attr('href')).submit();
                }
            });
        });
    }
});