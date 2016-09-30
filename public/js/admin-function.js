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
        var type = _.kebabCase(this.value); console.log(type);
        // show related items for type
        $('.multiple-choice, .true-or-false, .multiple-select').each(function () {
            var $col = $(this);
                $col.toggle($col.hasClass(type));
                $col.find(':input').prop('disabled', !$col.hasClass(type));
        });
    }).change();

    $('#modal-add-files .list-group-item :checkbox').click(function (e) {
        var $listGroup = $(this).closest('.list-group'),
            $listGroupItem = $(this).closest('.list-group-item'),
            $fileCounter = $('#file-counter');
        // toggle active state based on checkbox' state
        $listGroupItem.toggleClass('active', this.checked);
        // indicate # of files were selected
        var count = $listGroup.find(':checked').length;
        if (count) {
            $fileCounter.text(count > 1 ? count + ' files selected' : '1 file selected');    
        } else {
            $fileCounter.empty();
        }
    });

    $('#modal-add-files .list-group-item:has(.preview) a').click(function (e) {
        e.preventDefault();
        $(this).closest('.modal-body').find('.col-preview').html(
            $(this).next('.preview').clone().css('display', '')
        );
    });
    
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
    
    $('#col-groups .dropdown-menu a').on('click', function (e) { e.stopPropagation(); });

    $('#publish-tutorial-quiz').on('switchChange.bootstrapSwitch', function (e, state) {
        $.ajax($('#publish-tutorial-quiz-url').val(), {
            type: 'put',
            data: { published: state }, 
            success: function (res) {
                console.log(res.status);
            }
        });
    });

    $('#activate-tutorial-quiz').on('switchChange.bootstrapSwitch', function (e, state) {
        $.ajax($('#activate-tutorial-quiz-url').val(), {
            type: 'put',
            data: { active: state }, 
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
            onEscape: true,
            size: 'small',
            title: 'Confirm deletion',
            message: $('#btn-delete-message-template').text(),
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-sm'
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
            } // end of buttons
        }); // end of bootbox
    });

    $('#btn-upload-files').click(function (e) {
        e.preventDefault();
        var url = this.href, data = new FormData();
        // open dialog
        bootbox.dialog({
            onEscape: true,
            className: 'modal-upload-files',
            title: 'Select files',
            message: $('#btn-upload-message-template').text(),
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-sm'
                },
                upload: {
                    label: 'Upload files',
                    className: 'btn-default btn-sm',
                    callback: function () {
                        var files = $('#files')[0].files;
                        if (files.length) {
                            // add files
                            for (var i in files) {
                                data.append('files', files[i]);
                            }
                            // send request
                            $.ajax(url, {
                                type: 'post',
                                processData: false,
                                contentType: false,
                                data: data,
                                success: function(res) {
                                    if (res.status) {
                                        window.location.reload(true);
                                    }
                                }
                            });
                        }
                        return false;
                    }
                }
            } // end of buttons
        }); // end of bootbox
    });

    // open file input
    $(document).on('click','#btn-select-files', function (e) {
        $(this).next(':file').click();
    });

    // list files selected by file input
    $(document).on('change', '#files', function (e) {
        var files = this.files;
        $(this).next('.list-group').html(function () {
            return _.map(files, function (file) {
                return '<li class="list-group-item">' + file.name + '</li>';
            });
        });
    });

    // preview image and audio files
    $('#table-files tbody tr:has(.preview) a').on('click', function (e) {
        e.preventDefault();
        bootbox.dialog({
            onEscape: true,
            className: 'modal-preview-file',
            message: $(this).next('.preview').clone().css('display', '')
        });
    });

    // style checkboxes with switch control
    $(":checkbox.bootstrap-switch").bootstrapSwitch({  
        inverse: true,
        offText: 'No',
        onText: 'Yes',
        size: 'small',
    });

});