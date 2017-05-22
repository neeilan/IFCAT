$(function () {
    if ($('body').hasClass('quizzes')) {
        // Confirm and copy row
        $('.btn-copy').click(function (e) {
            e.preventDefault();
            $.post(this.href, function () {
                window.location.reload(true);
            });
        });
        // Confirm and delete row
        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = this;
            $.deletebox({
                title: 'Delete quiz',
                message: '<p>You are about to delete quiz and all of its associated information.</p>\
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