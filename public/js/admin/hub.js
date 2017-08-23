$(function () {
    var body = $(document.body);

    if (body.hasClass('hub-page')) {
        $('td.actions .btn').click(function (e) {
            e.preventDefault();
            var btn = $(this), tr = btn.closest('tr'), form = tr.closest('form');
            bootbox.dialog({
                title: 'Action',
                message: '<p>You are about to perform an action.</p>',
                buttons: {
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-sm'
                    },
                    proceed: {
                        label: btn.text(),
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
    }
});