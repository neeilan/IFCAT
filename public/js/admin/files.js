$(function () {
    var body = $(document.body);
    if (body.hasClass('files')) {
        // Confirm and delete selected rows
        $('#btn-delete').click(function (e) {
            e.preventDefault();
            var btn = this, inputs = $('tbody input[name^=files]:checked');
            if (inputs.length) {
                $.deletebox({
                    title: 'Delete files',
                    message: '<p>You are about to delete files <b>(' + inputs.length + ')</b> and all of their associations.</p>\
                        <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                    callback: function () {
                        $.delete(btn.href, inputs.serialize(), function () {
                            window.location.reload(true);
                        });
                    }
                })
            }
        });
        // Preview media file within a modal
        $('tbody > tr:has(.preview) a').click(function (e) {
            e.preventDefault();
            bootbox.dialog({
                onEscape: true,
                className: 'modal-preview-file',
                message: $(this).next('.preview').clone().css('display', '')
            });
        });
        // Show selected files within modal
        $('#modal-upload-files input[name=files]').change(function () {
            var options  = '';
            $.each(this.files, function (i, file) {
                options += '<li class="list-group-item">' + file.name + '</li>';
            });
            $(this).closest('.modal-body').find('.list-group').html(options);
        });
    }
});