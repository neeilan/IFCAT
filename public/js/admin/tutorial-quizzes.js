$(function () {
    if ($('body').hasClass('tutorial-quizzes')) {
        var form = $('form');
        // update selected tutorial quizzes
        $('.dropdown-menu a[data-name]').click(function () {
            var link = $(this);
            form.append(
                '<input type="hidden" name="' + link.data('name') + '" value="' + link.data('value') + '">'
            ).attr({
                'action': '/admin/courses/<%= course.id %>/conduct/edit?_method=put'
            }).submit();
        });
        // export marks
        $('#btn-export').click(function () {
            form.attr({
                'action': '/admin/courses/<%= course.id %>/conduct/marks?export=1'
            }).submit();
        });
    }
});