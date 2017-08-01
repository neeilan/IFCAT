$(function () {
    var body = $(document.body);
    if (body.hasClass('responses')) {
        $('.btn-edit').click(function () {
            var btn = $(this),
                panel = btn.closest('.panel');
            panel.find('code').attr('contenteditable', '');
            panel.find('.btn-delete').add(this).toggle(false);
            panel.find('.btn-cancel, .btn-update').toggle(true);
        });

        $('.btn-cancel').click(function () {
            var btn = $(this), 
                panel = btn.closest('.panel');
            panel.find('code').removeAttr('contenteditable');
            panel.find('.btn-update').add(this).toggle(false);
            panel.find('.btn-edit, .btn-delete').toggle(true);
        });

        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = this;
            $.deletebox({
                title: 'Delete response',
                message: '<p>You are about to delete this response and all of its associated information.</p>\
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