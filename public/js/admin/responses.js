$(function () {
    var body = $(document.body);

    if (body.hasClass('responses-page')) {
        // create hidden fields to store editable text
        $('code[data-name]').each(function () {
            $(this).after($('<input/>', { type: 'hidden', name: this.dataset.name, value: this.innerText, disabled: 'disabled' }));
        });
        // store editable text upon typing into editable text
        body.on('input', 'code[contenteditable][data-name]', function () {
            $(this).next(':hidden').val(this.innerText);
        });
        // set panel to edit-mode
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
            btn.toggle(false);
            panel.find('.btn-cancel, .btn-update').toggle(true);
        });
        // unset panel to nonedit-mode
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
            panel.find('.btn-update').add(btn).toggle(false);
            panel.find('.btn-edit').toggle(true);
        });
    }
});