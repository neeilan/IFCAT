$(function () {

    //$('[checked]').prop('checked', true).closest('.radio, .checkbox').addClass("active");

    $('th > input').change(function () {
        $(this).closest('table').find('td > input').prop('checked', this.checked);
    });

    $('.btn [type=file]').change(function () {
        $(this).parent().next('.label-info').html(this.value);
    });

    $('#question-form [name=type]').change(function () {
        var type = this.value.replace(/\s/g, '-');
        // show related items for type
        $('.multiple-choice, .true-or-false, .multiple-select').each(function () {
            var $col = $(this);
                $col.toggle($col.hasClass(type));
                $col.find(':input').prop('disabled', !$col.hasClass(type));
        });
    }).change();

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

    
    $('#question-form').on('click', '.remove-item', function (e) {
        e.preventDefault();
        $(this).closest('.form-group').remove();
    });

    $('#question-form .form-group .add-item').click(function (e) {
        e.preventDefault();
        var $grp = $(this).closest('.form-group'), $tpl = $('#MultipleChoiceTemplate');
        // append new choice before "add new choice" link
        $grp.before(_.template($tpl.text())({ id: parseInt(_.uniqueId(), 10) + 999 }));
    });

    $('.btn[data-url]').click(function (e) {
        e.preventDefault();
        $.post($(this).data('url'), function () {
            window.location.reload(true);
        });
    });
});