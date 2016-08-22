$(function () {

    $('.btn [type=file]').change(function () {
        $(this).parent().next('.label-info').html(this.value);
    });

    $('#question-form [name=type]').change(function () {
        var type = this.value;
        // show related items for type
        $('.MultipleChoice, .TrueOrFalse').each(function () {
            var $col = $(this);
                $col.toggle($col.hasClass(type));
                $col.find(':input').prop('disabled', !$col.hasClass(type));
        });
    }).change(); // !

    $('#file-modal .add-files').click(function (e) {
        var html = $('#file-modal .list-group-item.active').map(function () {
            return '<div>' +
                '<span>' + $(this).text() + '</span>' +
                '<input type="hidden" name="files[]" value="' + $(this).data('id') + '"">' +
            '</div>';
        }).get().join('');

        var $a = $('#question-form .add-files');
            $a.prevAll().remove();
            $a.before(html);
    });

    $('#question-form .MultipleChoice').on('click', '.mark-answer', function (e) {
        e.preventDefault();
        // toggle checkbox
        $(this).text($(this).siblings(':checkbox').click().prop('checked') ? 'Un-mark as an answer' : 'Mark as an answer');
    });

    $('#question-form .TrueOrFalse').on('click', '.mark-answer', function (e) {
        e.preventDefault();
        // toggle radio buttons
        $(this).siblings(':radio').click().closest('.TrueOrFalse').find('[name=answer]').each(function () {
            $(this).prev('a').toggle(!this.checked);
        });
    });
    
    $('#question-form').on('click', '.remove-choice', function (e) {
        e.preventDefault();
        $(this).closest('.form-group').remove();
    });

    $('#question-form #add-choice').click(function (e) {
        e.preventDefault();
        var $grp = $(this).closest('.form-group'), $tpl = $('#MultipleChoiceTemplate');
        // append new choice before "add new choice" link
        $grp.before(_.template($tpl.text())({ id: parseInt(_.uniqueId(), 10) + 999 }));
    });

});