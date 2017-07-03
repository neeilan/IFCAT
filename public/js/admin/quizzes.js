$(function () {
    var body = $(document.body);
    if (body.hasClass('quizzes')) {
        $('.btn-copy').click(function (e) {
            e.preventDefault();
            var btn = this;
            bootbox.dialog({
                title: 'Copy quiz',
                message: '<p>You are about to copy quiz and all of its associated questions.</p>\
                    <p>This does <b>not</b> however copy its tutorial associations.</p>\
                    <p>Do you want to proceed with this action?</p>',
                buttons: {
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-sm'
                    },
                    copy: {
                        label: 'Copy',
                        className: 'btn-sm btn-success',
                        callback: function (result) {
                            if (result) {
                                $.post(btn.href, function () {
                                    window.location.reload(true);
                                });
                            }
                        }
                    }
                }
            });
        });
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