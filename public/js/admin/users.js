$(function () {
    var body = $('body');
    if (body.hasClass('users')) {
        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = this;
            $.deletebox({
                title: 'Delete user',
                message: '<p>You are about to delete user and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    $.delete(btn.href, function () {
                        window.location.reload(true);
                    });
                }
            });
        });
    }
    if (body.hasClass('instructors') || body.hasClass('teaching-assistants') || body.hasClass('students')) {
        $('#btn-search').click(function () {
            var input = $(this);
            $('#search-results').load(input.closest('form')[0].action + '/search?q=' + input.prev('[name=q]').val());
        });
        $('#btn-delete').click(function (e) {
            e.preventDefault();
            var inputs = $(
                ':not(.modal) input[name^=instructors]:checked,' +
                ':not(.modal) input[name^=teachingAssistants]:checked,' +
                ':not(.modal) input[name^=students]:checked'
            );
            if (inputs.length) {
                $.delete(this.href, inputs.serialize(), function () { 
                    window.location.reload(true);
                });
            }
        });
    }
    if (body.hasClass('teaching-assistants') || body.hasClass('students')) {
        $('#btn-update').click(function (e) {
            e.preventDefault();
            $.put(this.href, $(':not(.modal) input[name^=tutorials]:checked').serialize(), function () { 
                window.location.reload(true);
            });
        });
    }
});