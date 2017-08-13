$(function () {

    // set default AJAX options
    $.ajaxSetup({ cache: false });

    // activate current navbar item
    $('#navbar-collapse li > a[href!="#"]').each(function () {
        if (window.location.href.indexOf(this.href) > -1) {
            $(this).parent().addClass('active');
            return false;
        }
    });

    // checked/unchecked all table-body checkboxes when table-header checkbox is checked/unchecked
    $(document).on('change', 'th > :checkbox', function () {
        var checkbox = $(this), 
            index = checkbox.parent().index();
        checkbox.closest('table').find('tr').each(function () {
            $('td:eq(' + index + ') > :checkbox:not(:disabled)', this).prop('checked', checkbox[0].checked);
        });
    });

    // style checkboxes with switch control
    $(':checkbox.bootstrap-switch').bootstrapSwitch({
        inverse: true,
        offText: 'No',
        onText: 'Yes'
    });

    // save last opened tab
    $('a[data-toggle=tab]').on('shown.bs.tab', function () {
        localStorage.setItem('tab-open', $(this).attr('href'));
    });
    // open last opened tab
    var tab = localStorage.getItem('tab-open');
    if (tab) {
        $('a[href="' + tab + '"]').tab('show');
    }

    // set default bootbox options
    bootbox.setDefaults({
        onEscape: true,
        size: 'small'
    });

    // small plugin for creating confirm dialogs on the fly
    // @usage: $.deletebox(options)
    $.deletebox = function (options) {
        bootbox.dialog({
            title: options.title,
            message: options.message,
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-sm'
                },
                danger: {
                    label: 'Delete',
                    className: 'btn-sm btn-danger',
                    callback: function (result) {
                        if (result) {
                            options.callback();
                        }
                    }
                }
            }
        });
    };
});