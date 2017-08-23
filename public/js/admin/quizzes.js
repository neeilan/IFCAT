$(function () {
    var body = $(document.body);

    if (body.hasClass('quizzes-page')) {
        $('.btn-copy').click(function (e) {
            e.preventDefault();
            var btn = $(this), tr = btn.closest('tr'), form = tr.closest('form');
            bootbox.dialog({
                title: 'Copy quiz',
                message: '<p>You are about to copy quiz <b>' + tr.find('.name').text() + '</b> and all of its associated questions.</p>\
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
                                form.attr('action', btn.attr('href')).submit();
                            }
                        }
                    }
                }
            });
        });

        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = $(this), tr = btn.closest('tr'), form = tr.closest('form');
            $.deletebox({
                title: 'Delete quiz',
                message: '<p>You are about to delete quiz <b>' + tr.find('.name').text() + '</b> and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    form.attr('action', btn.attr('href')).submit();
                }
            });
        });
    }
});