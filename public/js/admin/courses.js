$(function () {
    var body = $(document.body);

    if (body.hasClass('courses-page')) {
        // Confirm and delete selected row
        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = $(this);
            $.deletebox({
                title: 'Delete course',
                message: '<p>You are about to delete course and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    btn.closest('form').attr('action', btn.attr('href')).submit();
                }
            });
        });
    }
});