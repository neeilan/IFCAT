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
    $('#form-search-user').submit(function (e) {
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

    $('#table-quiz-questions .sortable').sortable({
        axis: 'y', 
        cancel: false
    });

    $('#btn-sort-questions').click(function (e) {
        e.preventDefault();
        $.ajax(this.href, {
            type: 'put',
            data: $('#table-quiz-questions tr[data-id]').map(function () {
                return { name: 'questions[]', value: $(this).data('id') };
            }), 
            success: function (res) {
                if (res.status) {
                    window.location.reload(true);
                }
            },
            dataType: 'json'
        });
    });

    $('#form-question [name=type]').change(function () {
        var type = _.kebabCase(this.value);
        // show related items for type
        $('.multiple-choice, .true-or-false, .multiple-select').each(function () {
            var $col = $(this);
                $col.toggle($col.hasClass(type));
                $col.find(':input').prop('disabled', !$col.hasClass(type));
        });
    }).change();
    
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
    
    $('#col-unassigned-students .sortable, #col-groups .sortable').sortable(options);

    $('#form-tutorial-quiz-group [name=published]').on('change', function (e) {
        $.ajax($('#publish-tutorial-quiz-url').val(), {
            type: 'put',
            data: { published: this.value }, 
            success: function (res) {
                console.log(res.status);
            }
        });
    });

    $('#form-tutorial-quiz-group [name=unlocked]').on('change', function (e) {
        $.ajax($('#unlock-tutorial-quiz-url').val(), {
            type: 'put',
            data: { unlocked: this.value }, 
            success: function (res) {
                console.log(res.status);
            }
        });
    });

    $('#form-tutorial-quiz-group [name=active]').on('change', function (e) {
        $.ajax($('#activate-tutorial-quiz-url').val(), {
            type: 'put',
            data: { active: this.value }, 
            success: function (res) {
                console.log(res.status);
            }
        });
    });

    /*$('#btn-add-group').click(function () {
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
    });*/

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

    //

    $('.btn-delete').click(function (e) {
        e.preventDefault();
        var url = this.href, data = null;
        if (this.id === 'btn-delete-files') {
            data = $('#table-files :checkbox:checked').serialize();
        }
        // open confirmation dialog before performing deletion
        bootbox.dialog({
            title: 'Confirm deletion',
            message: $('#btn-delete-message-template').text(),
            buttons: {
                cancel: {
                    label: 'Cancel'
                },
                danger: {
                    label: 'Delete',
                    className: 'btn-danger',
                    callback: function (res) {
                        if (res) {
                            // perform deletion
                            $.ajax(url, {
                                type: 'delete',
                                data: data,
                                success: function (res) {
                                    if (res.status) {
                                        window.location.reload(true);
                                    }     
                                }
                            });
                        }
                    }
                }
            },
            onEscape: true,
            size: 'small'
        });
    });



});