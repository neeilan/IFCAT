$(function () {
    // small plugins for making PATCH, PUT and DELETE requests
    // @usage: $.{method}(url, data, callback)
    $.each(['patch', 'put', 'delete'], function (i, method) {
        $[method] = function (url, data, callback, type) {
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return $.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

    // small plugin for building circle buttons
    // @usage: $(selector).buttonCircle()
    // @usage: $(selector).buttonCircle('serialize')
    $.fn.buttonCircle = function () {
        // create buttons
        this.find(':checkbox[data-label]').each(function () {
            var input = $(this),
                label = $('<label/>', { html: this.dataset.label }),
                btn = $('<div/>', { class: 'btn-circle' + (this.checked ? ' active' : '') })
            input.wrap(btn).before(label);
        });
        // toggle buttons
        return this.on('click', '.btn-circle', function () {
            var btn = $(this),
                input = btn.find(':checkbox');
            input.prop('checked', !input.is(':checked'));
            btn.toggleClass('active', input.is(':checked'));
            // expect other inputs to be checked if name ends with []
            if (input.attr('name').endsWith('[]')) return;
            // otherwise uncheck other inputs having the same name
            $('.btn-circle > input[name="' + input.attr('name') + '"]').not(input).each(function () {
                $(this).prop('checked', false).parent().removeClass('active');
            });
        });
    };
});