$(function () {
    if ($('body').hasClass('questions')) {
        var container = $('.container'),
            heading = $('> h1'),
            table = $('> table:eq(0)'),
            dim = table.closest('.dim-wrap');
        // Confirm and delete selected row
        $('.btn-delete', table).click(function (e) {
            e.preventDefault();
            var btn = this;
            $.deletebox({
                title: 'Delete question',
                message: '<p>You are about to delete question and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    $.delete(btn.href, function () {
                        window.location.reload(true)
                    });
                }
            });
        });
        // Drag and drop rows
        $('tbody', table).sortable({ 
            axis: 'y', 
            cancel: false,
            handle: '.handle',
            update: function (e, ui) {
                dim.addClass('on');
                $.ajax(window.location.href.split(/[?#]/)[0] + '/sort', {
                    type: 'put',
                    data: $(ui).serialize(),
                    error: function (xhr) {
                        heading.after('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert">&times;</a>' + xhr.responseText + '</div>')
                    },
                    complete: function () {
                        dim.removeClass('on');
                    }
                });
            }
        });
    }
});