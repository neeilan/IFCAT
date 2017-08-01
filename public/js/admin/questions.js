$(function () {
    var body = $(document.body);

    if (body.hasClass('questions')) {
        // Confirm and delete selected row
        $('.btn-delete').click(function (e) {
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
        $('tbody').sortable({ 
            axis: 'y', 
            cancel: false,
            handle: '.handle',
            update: function (e, ui) {
                var self = $(this),
                    url = window.location.href.split(/[?#]/)[0] + '/sort',
                    data = $('input[name^=questions]', ui.item).serialize();
                $.put(url, data, function () {
                    // do nothing
                }).fail(function (xhr) {
                    $('.alert-danger').remove();
                    $('#title').after('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert">&times;</a>' + xhr.responseText + '</div>');
                    // undo change
                    self.sortable('cancel');
                });
            }
        });
    }

    if (body.hasClass('question')) {
        // Change DOM upon changing question type
        $('select[name=type]').change(function () {
            var select = this;
            $('.form-group[data-type]').each(function () {
                $(this).enableToggle(this.dataset.type.indexOf(select.value) > -1);
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
        // Resize code-tracing fields
        $('[contenteditable]').on('input', function () {
            $(this.dataset.target).val(this.innerText);
        });
        // Remove choice input
        $(document).on('click', '.glyphicon-remove', function () {
            $(this).closest('.form-group').remove();
        });
        // Add choice input
        var id = 999;
        $('.btn-add-choice').click(function () {
            var template = $(this).closest('.form-group').prev(),
                clone = template.clone().toggle(true);
            clone.find('textarea').attr('name', function () {
                return this.name.replace(/\[\]$/, '[' + (++id) + ']');
            });
            clone.find(':radio, :checkbox').val(id);
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
        $('#btn-preview').click(function (e) {
            e.preventDefault();
            if (win) {
                win.close();
            }
            $.post(this.href, $(this).closest('form').serialize(), function (res) {
                win = window.open('', '_preview', 'width=800, height=600');
                win.document.write(res);
                win.document.close();
            }, 'html');
        });
    }
});