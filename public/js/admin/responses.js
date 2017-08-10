$(function () {
    var body = $(document.body);

    if (body.hasClass('responses-page')) {
        // Create hidden fields to store editable text
        $('code[data-name]').each(function () {
            $(this).after($('<input/>', { type: 'hidden', name: this.dataset.name, value: this.innerText, disabled: 'disabled' }));
        });
        // Store editable text upon typing into editable text
        body.on('input', 'code[contenteditable][data-name]', function () {
            $(this).next(':hidden').val(this.innerText);
        });

        $('.btn-edit').click(function () {
            var btn = $(this),
                panel = btn.closest('.panel');
    
            panel.find('input[name]').each(function () {
                var input = $(this);
                // save old state
                switch (input.attr('type')) {
                    case 'radio':
                    case 'checkbox':
                        input.attr('data-checked', input.prop('checked') ? 1 : 0); break;
                    default:
                        input.attr('data-value', input.val()); break;
                }
                // enable input
                input.prop('disabled', false);
            });
            // enable editable code
            panel.find('code[data-name]').attr('contenteditable', '').first().focus();
            // toggle buttons
            panel.find('.btn-delete').add(this).toggle(false);
            panel.find('.btn-cancel, .btn-update').toggle(true);
        });

        $('.btn-cancel').click(function () {
            var btn = $(this), 
                panel = btn.closest('.panel');

            panel.find('input[name]').each(function () {
                var input = $(this);
                // set old state
                switch (input.attr('type')) {
                    case 'radio':
                    case 'checkbox':
                        input.prop('checked', !!input.data('checked')).removeAttr('data-checked'); break;
                    default:
                        input.val(input.data('value')).removeAttr('data-value'); break;
                }
                // disable input
                input.prop('disabled', true);
            });
            panel.find('code[data-name]').each(function () {
                var code = $(this);
                // set old state and disable editable code
                code.text(code.next('input').val()).removeAttr('contenteditable');
            });
            panel.find('.btn-update').add(this).toggle(false);
            panel.find('.btn-edit, .btn-delete').toggle(true);
        });

        // $('.btn-update').click(function (e) {
        //     e.preventDefault();
        //     var btn = $(this),
        //         panel = btn.closest('.panel'),
        //         inputs = panel.find('input');
        //     $.put(this.href, inputs.serialize()).then(function () {
        //         // set new state and disable
        //         inputs.removeAttr('data-checked').removeAttr('data-value').prop('disabled', true);
        //         panel.find('code[data-name]').removeAttr('contenteditable');
        //         // toggle buttons
        //         panel.find('.btn-cancel').add(this).toggle(false);
        //         panel.find('.btn-edit, .btn-delete').toggle(true);
        //     }).fail(function () {
        //         // set old state and disable
        //         panel.find('.btn-cancel').click();
        //     });
        // });

        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = $(this);
            var alert = $('<div/>', {
                class: 'alert alert-dismissible',
                html: '<button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>'
            });
            $.deletebox({
                title: 'Delete response',
                message: '<p>You are about to delete this response and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    $.delete(btn.attr('href')).then(function (res) {
                        window.location.reload();
                    }).fail(function (xhr) {
                        console.log(xhr)
                        alert.addClass('alert-danger').text(xhr);
                        btn.closest('.panel').replaceWith(alert);
                    });
                }
            });
        });
    }
});