$(function () {
    // turn off caching
    $.ajaxSetup({ cache: false });
    // checked/unchecked all table-body checkboxes when table-header checkbox is checked/unchecked
    $('th > :checkbox').change(function () {
        $(this).closest('table').find('td > :checkbox').prop('checked', this.checked);
    });
    // 
    $('.btn [type=file]').change(function () {
        $(this).parent().next('.label-info').html(this.value);
    });

    // users handlers

    // search users when form is submitted
    $('#search-user-form').submit(function (e) {
        e.preventDefault();
        $('#search-user-results').load(this.action, $(this).serialize());
    });
    // update user in tutorials when button is clicked
    $('.btn-update-user').click(function () {
        var $tr = $(this).closest('tr');
        // send request
        $.ajax($(this).data('url'), {
            type: 'put',
            data: $tr.find(':input').serialize(),
            success: function (res) {
                if (res.status) {
                    window.location.reload(true);
                }
            },
            dataType: 'json'
        });
    });
    // delete user from course when button is clicked
    $('.btn-delete-user').click(function () {
        var $tr = $(this).closest('tr');
        // send request
        $.ajax($(this).data('url'), {
            type: 'delete',
            success: function (res) {
                if (res.status) {
                    window.location.reload(true);
                }
            },
            dataType: 'json'
        });
    });
    // add user to course when button is clicked
    $('#search-user-results').on('click', '.btn-add-user', function () {
        var $tr = $(this).closest('tr');
        // send request
        $.post($(this).data('url'), function (res) {
            if (res.status) {
                window.location.reload(true);
            }
        }, 'json');
    });

    // question handlers

    $('#question-form [name=type]').change(function () {
        var type = _.kebabCase(this.value);
        // show related items for type
        $('.multiple-choice, .true-or-false, .multiple-select').each(function () {
            var $col = $(this);
                $col.toggle($col.hasClass(type));
                $col.find(':input').prop('disabled', !$col.hasClass(type));
        });
    }).change();

    /*$('#file-modal .add-files').click(function (e) {
        var html = $('#file-modal .list-group-item.active').map(function () {
            return '<div>' +
                '<span>' + $(this).text() + '</span>' +
                '<input type="hidden" name="files[]" value="' + $(this).data('id') + '"">' +
            '</div>';
        }).get().join('');

        var $a = $('#question-form .add-files');
            $a.prevAll().remove();
            $a.before(html);
    });*/

    
    $('.multiple-choice, .multiple-select').on('click', '.btn-remove-choice', function (e) {
        e.preventDefault();
        $(this).closest('.form-group').remove();
    });

    $('.multiple-choice, .multiple-select').on('click', '.btn-add-choice', function (e) {
        e.preventDefault();
        var $col = $(e.delegateTarget), 
            type = 'multiple-choice';
        if ($col.hasClass('multiple-select')) {
            type = 'multiple-select';
        }
        $(e.target).closest('.form-group').before(
            _.template($('[id=' + type + '-template]').text())({
                id: parseInt(_.uniqueId(), 10) + 999 // unlikely conflicting number
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

    $('.btn-remove-group').click(function () {
        var $panel = $(this).closest('.panel');
            $panel.find('.sortable > .btn').appendTo($('#col-unassigned-students > .panel'));
            $panel.remove();
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