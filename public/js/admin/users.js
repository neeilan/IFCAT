$(function () {
    if ($('body').hasClass('users')) {
        // add user to course when button is clicked
        $('#btn-search').click(function () {
            $('#search-results').load($(this).closest('form')[0].action + '/search?q=' + q.value);
        });
        // delete user from course when button is clicked
        $('.btn-delete-user').click(function (e) {
            e.preventDefault();
            $.delete(this.href, function () { window.location.reload(true); });
        });
    }
    if ($('body').hasClass('instructors')) {
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
    if ($('body').hasClass('teaching-assistants')) {
        $('#btn-delete').click(function () {
            var inputs = $('tbody [name^=teachingAssistants]:checked');
            if (inputs.length) {
                $.delete('/admin/courses/<%= course.id %>/teaching-assistants', inputs.serialize(), function () { 
                    window.location.reload(true);
                });
            }
        });
    }
    if ($('body').hasClass('students')) {
        $('#btn-delete').click(function () {
            var inputs = $('tbody [name^=students]:checked');
            if (inputs.length) {
                $.delete('/admin/courses/<%= course.id %>/students', inputs.serialize(), function () { 
                    window.location.reload(true);
                });
            }
        });
    }
});