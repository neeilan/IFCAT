$(function () {
    var body = $(document.body);

    if (body.hasClass('files-page')) {
        // Confirm and delete selected rows
        $('#btn-delete').click(function (e) {
            e.preventDefault();
            var btn = $(this);
            $.deletebox({
                title: 'Delete files',
                message: '<p>You are about to delete the selected files and all of their associations.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    btn.closest('form').attr('action', btn.attr('href')).submit();
                }
            });
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