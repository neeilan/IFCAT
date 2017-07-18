$(function () {
    // small plugin for showing/hiding selector and enabling/disabling its children
    // @usage: $(selector).enableToggle(true|false)
    $.fn.enableToggle = function (display) {
        this.toggle(display).find(':input').prop('disabled', !display);
        return this;
    };
    // Change DOM upon changing question type
    $('select[name=type]').change(function () {
        var select = this;
        $('.form-group[data-type]').each(function () {
            $(this).enableToggle(this.dataset.type.indexOf(select.value) > -1);
        });
    }).change();
    // Resize code-tracing fields
    $('div[contenteditable]').on('input', function () {
        $(this).next().val(this.innerText);
    });
    // Remove choice input
    $(document).on('click', '.glyphicon-remove', function () {
        $(this).closest('.form-group').remove();
    });
    // Add choice input
    $('.btn-add-choice').click(function () {
        var template = $(this).closest('.form-group').prev(),
            clone = template.clone().toggle(true),
            id = _.toNumber(_.uniqueId()) + 999;
        clone.find('textarea').attr('name', function () {
            return this.name.replace(/\[\]$/, '[' + id + ']');
        });
        clone.find(':radio, :checkbox').val(id);
        template.before(clone);
    });
});