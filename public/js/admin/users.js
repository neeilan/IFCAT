$(function () {
    var body = $(document.body);

    if (body.hasClass('users-page')) {
        $('.btn-delete').click(function (e) {
            e.preventDefault();
            var btn = $(this), tr = btn.closest('tr'), form = tr.closest('form');
            $.deletebox({
                title: 'Delete user',
                message: '<p>You are about to delete user <b>' + tr.find('.name').text() + '</b> and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    form.attr('action', btn.attr('href')).submit();
                }
            });
        });
    }

    if (body.hasClass('instructors-page') || body.hasClass('teaching-assistants-page') || body.hasClass('students-page')) {
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
    }
});