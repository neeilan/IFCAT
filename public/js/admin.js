$(function () {

    // turn off caching
    $.ajaxSetup({ cache: false });

    // checked/unchecked all table-body checkboxes when table-header checkbox is checked/unchecked
    $('th :checkbox').change(function () {
        $(this).closest('table').find('td :checkbox').prop('checked', this.checked);
    });

    // 
    $('.btn [type=file]').change(function () {
        $(this).parent().next('.label-info').html(this.value);
    });

    // search users when form is submitted
    $('#modal-find form').submit(function (e) {
        e.preventDefault();
        var $form = $(this);
            $form.next('div').load(this.action, $form.serialize());
    });
    // add user to course when button is clicked
    $('#modal-find').on('click', 'a', function (e) {
        e.preventDefault();
        $.post(this.href, function (res) {
            window.location.reload(true); // TO-FIX
        });
    });
    // update user in tutorials when button is clicked
    $('.btn-update-user').click(function (e) {
        e.preventDefault();
        $.ajax(this.href, {
            type: 'put',
            data: $(this).closest('tr').find(':input').serialize(),
            success: function (res) {
                window.location.reload(true); // TO-FIX
            }
        });
    });
    // delete user from course when button is clicked
    $('.btn-delete-user').click(function (e) {
        e.preventDefault();
        $.ajax(this.href, {
            type: 'delete',
            success: function (res) {
                window.location.reload(true); // TO-FIX
            }
        });
    });

    $('.btn-delete').click(function (e) {
        e.preventDefault();
        var url = this.href, data = null;
        if (this.id === 'btn-delete-files') {
            data = $('#table-files :checkbox:checked').serialize();
        }
        // open confirmation dialog before performing deletion
        bootbox.dialog({
            onEscape: true,
            size: 'small',
            title: 'Confirm deletion',
            message: $('#btn-delete-message-template').text(),
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-sm'
                },
                danger: {
                    label: 'Delete',
                    className: 'btn-danger',
                    callback: function (res) {
                        if (res) {
                            // perform deletion
                            $.ajax(url, {
                                type: 'delete',
                                data: data,
                                success: function (res) {
                                    if (res.status) {
                                        window.location.reload(true);
                                    }     
                                }
                            });
                        }
                    }
                }
            } // end of buttons
        }); // end of bootbox
    });

    // style checkboxes with switch control
    $(":checkbox.bootstrap-switch").bootstrapSwitch({  
        inverse: true,
        offText: 'No',
        onText: 'Yes',
        size: 'small',
    });

});