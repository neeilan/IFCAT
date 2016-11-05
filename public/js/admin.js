$(function () { 
    // turn off caching
    $.ajaxSetup({ cache: false });

    // wrap tables with  special container 
    $('.dim, .stretch').each(function() {
        var $elem = $(this), $div = $('<div/>');
        if ($elem.hasClass('stretch')) {
            $div.addClass('stretch-wrap');
        }
        if ($elem.hasClass('dim')) {
            $div.addClass('dim-wrap');
        }
        $elem.wrap($div);

        if ($elem.hasClass('dim')) {
            $elem.after('<div class="dimmer"></div>'); // overlay
        }
    });

    // checked/unchecked all table-body checkboxes when table-header checkbox is checked/unchecked
    $('th :checkbox').change(function () {
        $(this).closest('table').find('td :checkbox').prop('checked', this.checked);
    });

    // 
    $('.btn [type=file]').change(function () {
        $(this).parent().next('.label-info').html(this.value);
    });

    // search users when form is submitted
    $('#modal-find-users form').submit(function (e) {
        e.preventDefault();
        var $form = $(this);
            $form.next('div').load(this.action, $form.serialize());
    });

    // add user to course when button is clicked
    $('#modal-find-users').on('click', 'td > a', function (e) {
        e.preventDefault();
        $.bootstrapAlert('close');
        var $heading = $('.container > h1'),
            $table = $('#table-users'), 
            $tr = $(this).closest('tr');
        $.ajax(this.href, {
            type: 'post',
            success: function (res) {
                $heading.after($.bootstrapAlert('success', res));
                $table.loadInner(window.location.href);
                $tr.remove();
            },
            error: function (xhr) {
                $heading.after($.bootstrapAlert('error', xhr.responseText));
            }
        });
    });
    // update user in tutorials when button is clicked      
    $('#table-users').on('click', '.btn-update-user').click(function (e) {        
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
    $('#table-users').on('click', '.btn-delete-user', function (e) {
        e.preventDefault();
        $.ajax(this.href, {
            type: 'delete',
            success: function (res) {
                window.location.reload(true); // TO-FIX
            }
        });
    });

    // style checkboxes with switch control
    $(":checkbox.bootstrap-switch").bootstrapSwitch({  
        inverse: true,
        offText: 'No',
        onText: 'Yes',
        size: 'small',
    });

    // small plugin for loading inner html from url + selector
    // @usage: $(selector).loadInner(url, data, callback)
    $.fn.loadInner = function () {
        if (arguments.length) {
            arguments[0] += ' ' + $(this).selector + ' > *';
        }
        console.log('args', arguments)
        return this.load.apply(this, arguments);
    };

    // small plugin for creating alerts on the fly
    // @usage: $.bootstrapAlert(type, msg).after(...)
    $.bootstrapAlert = function () {
        if (arguments[0] === 'close') {
            return $('.alert-dismissible').remove();
        }
        return $('<div/>', {
            class: 'alert alert-' + arguments[0] + ' alert-dismissible',
            html: '<a href="#" class="close" data-dismiss="alert">&times;</a>' + arguments[1]
        });
    };

    // small plugin for creating confirm dialogs on the fly
    // @usage: $.deletebox(options)
    $.deletebox = function (options) {
        bootbox.dialog({
            onEscape: true,
            size: 'small',
            title: options.title,
            message: options.message,
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
                            options.callback();
                        }
                    }
                }
            }
        });
    };
});