$(function () {
    var body = $(document.body);

    if (body.hasClass('users-page')) {
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

    if (body.hasClass('instructors-page') || body.hasClass('tas-page') || body.hasClass('students-page')) {
        // create buttons
        $('tbody').buttonCircle();

        $('#modal-find-users form').submit(function (e) {
            e.preventDefault();
            $('#search-results').load(this.action + '?q=' + encodeURIComponent(this.elements.q.value));
        });

        $('#search-results').on('click', 'a', function (e) {
            e.preventDefault();
            $(e.delegateTarget).load(this.href);
        });

        $('#btn-add').click(function (e) {
            e.preventDefault();
            var inputs = $('#modal-find-users input');
            if (inputs.length) {
                $.post(this.href, inputs.serialize(), function () {
                    window.location.reload(true);
                });
            }
        });

        $('#btn-update').click(function (e) {
            e.preventDefault();
            $.patch(this.href, $(':not(.modal) input').serialize(), function () { 
                window.location.reload(true);
            });
        });

        $('#btn-delete').click(function (e) {
            e.preventDefault();
            var inputs = $(':not(.modal) input[name="-users\[\]"]:checked');
            if (inputs.length) {
                $.delete(this.href, inputs.serialize(), function () { 
                    window.location.reload(true);
                });
            }
        });
    }
});