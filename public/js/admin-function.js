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

    $('#btn-add-choice').click(function () {
        // append new choice before "add new choice" link
        $(this).closest('.form-group').before(
            _.template($('#MultipleChoiceTemplate').text())({
                // parseInt(_.uniqueId(), 10) + 999 is an unlikely conflicting number
                id: parseInt(_.uniqueId(), 10) + 999 
            })
        );
    });

    // setup group handlers

    var options = { 
        cancel: false, 
        connectWith: '.sortable' 
    };
    
    $('.sortable').sortable(options);

    $('#btn-add-group').click(function () {
        var $tpl = $(_.template($('#panel-group-template').text())({ id: parseInt(_.uniqueId(), 10) + 999 }));
            $tpl.find('.sortable').sortable(options);
            $tpl.prependTo($('#panel-groups'));
    });

    $('#btn-generate-groups').click(function () {
        var url = $('#generate-groups-url').val();
        var $tpl = $(_.template($('#panel-group-template').text())({ id: parseInt(_.uniqueId(), 10) + 999 }));
        var $list = $('#panel-groups').empty();
        // send request
        $.getJSON(url, function (res) {
            // create groups
            res.groups.forEach(function (group) {
                // create group
                var $item = $tpl.clone(),
                    $body = $item.find('.sortable').sortable(options);
                // create members + add them to group
                group.members.forEach(function (member) {
                    $body.append(
                        $('<button/>', {
                            type: 'button',
                            class: 'btn btn-default btn-block',
                            dataMemberId: member.id,
                            text: member.name.first + ' ' + member.name.last
                        })
                    );
                });
                // add group
                $list.append($item);
            });
            
        });
    });

    $('#btn-save-groups').click(function () {
        var url = $('#save-groups-url').val(),
            data = [];
        // build data
        $('[data-group-id]').each(function () {
            var group = $(this).data('group-id');
            $('[data-member-id]', this).each(function () {
                data.push({
                    name: 'groups[' + group + ']',
                    value: $(this).data('member-id')
                });
            }); 
        });
        // send request
        $.post(url, data, function () { 
            window.location.reload(true);
        });
    });
});