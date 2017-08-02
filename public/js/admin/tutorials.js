$(function () {
    var body = $(document.body);

    if (body.hasClass('tutorials-page')) {
        // Confirm and delete tutorial upon click
        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = this;
            $.deletebox({
                title: 'Delete tutorial',
                message: '<p>You are about to delete tutorial and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    $.delete(btn.href, function () {
                        window.location.reload(true);
                    });
                }
            });
        });
    }
});