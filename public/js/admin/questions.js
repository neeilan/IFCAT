$(function () {
    if ($('body').hasClass('questions')) {
        var heading = $('> h1'),
            table = $('table:eq(0)'),
            dim = table.closest('.dim-wrap');
        // Confirm and delete selected row
        $('.btn-delete', table).click(function (e) {
            e.preventDefault();
            var btn = this;
            $.deletebox({
                title: 'Delete question',
                message: '<p>You are about to delete question and all of its associated information.</p>\
                    <p>This action <b>cannot be undone</b>. Do you want to proceed with this action?</p>',
                callback: function () {
                    $.delete(btn.href, function () {
                        window.location.reload(true)
                    });
                }
            });
        });
        // Drag and drop rows
        $('tbody', table).sortable({ 
            axis: 'y', 
            cancel: false,
            handle: '.handle',
            update: function () {
                dim.addClass('on');
                $.ajax(window.location.href.split(/[?#]/)[0] + '/sort', {
                    type: 'put',
                    data: $('input[name^=questions]', table).serialize(),
                    error: function (xhr) {
                        heading.after('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert">&times;</a>' + xhr.responseText + '</div>')
                    },
                    complete: function () {
                        dim.removeClass('on');
                    }
                });
            }
        });
    }

    if ($('body').hasClass('question')) {
        // Change DOM upon changing question type
        $('select[name=type]').change(function () {
            var select = this;
            $('div[data-type]').each(function () {
                $(this).enableToggle(this.dataset.type === select.value);
            });
        }).change();
        // Toggle checkboxes for selecting/unselecting files
        $('#modal-show-files .list-group-item :checkbox').click(function () {
            $(this).closest('.list-group-item').toggleClass('active', this.checked);
        });
        // Open media in preview window
        $('#modal-show-files .list-group-item:has(.preview) a').click(function (e) {
            e.preventDefault();
            $(this).closest('.modal-body').find('.col-preview').html(
                $(this).next('.preview').clone().css('display', '')
            );
        });
        // Update file counter
        $('#modal-show-files').on('hidden.bs.modal', function () {
            var count = $(this).find(':checked').length;
            $('.counter.files').text(count !== 1 ? count + ' files selected' : '1 file selected');
        });
        // Add new link input
        $('#btn-add-link').click(function () {
            var template = $(this).closest('.form-group').prev(),
                clone = template.clone().toggle(true);
            template.before(clone);
        });
        // Change link counter
        $('#modal-show-links').on('hidden.bs.modal', function () {
            var count = 0;
            $('[name^=links]', this).each(function() { 
                count += $.trim(this.value) !== '' ? 1 : 0;
            });
            $('.counter.links').text(count + ' link' + (count !== 1 ? 's' : '') + ' added');
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
            // replace [new]
            $('textarea', clone).attr('name', function () {
                return this.name.replace(/new/, id);
            });
            $(':radio, :checkbox', clone).val(function () {
                return this.value.replace(/new/, id);
            });
            template.before(clone);
        });
        //
        $(document).on('change', '[name=points], [name=firstTryBonus], [name=penalty]', function () {
            var points = _.defaultTo(_.toNumber($('[name=points]').val()), 0), 
                firstTryBonus = _.defaultTo(_.toNumber($('[name=firstTryBonus]').val()), 0),
                penalty = _.defaultTo(_.toNumber($('[name=penalty]').val()), 0);
            var table = '';

            if (points > 0 && penalty > 0) {
                var attempts = [];
                // bug: flawed point system
                var first = true;
                while (points > 0) {
                    if (first) {
                        attempts.push(points + firstTryBonus);
                        first = false;
                    } else {
                        attempts.push(points);
                    }
                    points -= penalty;
                }

                table  = '<table class="table table-striped table-bordered" style="min-width: auto; width: 200px">';
                for (var j = 0, len = attempts.length; j < len; j++)
                    table += '<tr><td>Attempt #' + (j + 1) + '</td><td>' + attempts[j] + '</td></tr>';
                table += '</table>';
            }
            // add table
            $('#points-calculator').html(table);
        });
        // Preview question
        var win;
        $('#btn-preview').click(function () {
            // close previous window
            if (win) {
                win.close();
            }
            $.ajax('/admin/courses/<%- course.id %>/quizzes/<%- quiz.id %>/questions/preview', {
                type: 'post',
                data: $(this).closest('form').serialize(),
                dataType: 'html',
                success: function (res) {
                    // open new window
                    win = window.open('', '_preview', 'width=800, height=600');
                    win.document.write(res);
                    win.document.close();
                }
            });
        });
    }
});