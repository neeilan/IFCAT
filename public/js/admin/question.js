$(function () {
    if ($('body').hasClass('question')) {
        var win;
        // Change DOM upon changing question type
        $('select[name=type]').change(function () {
            var select = this;
            $('div[data-type]').each(function () {
                $(this).enableToggle(this.dataset.type.split('|').indexOf(select.value) > -1);
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
            $('#file-counter').text(count !== 1 ? count + ' files selected' : '1 file selected');
        });
        // Add new link input
        $('#btn-add-link').click(function () {
            $(this).closest('.form-group').before(function () {
                var id = _.toNumber(_.uniqueId()) + 999;
                var $new = $(this).next().clone().toggle(true);
                return $new;
            });
        });
        // Change link counter
        $('#modal-show-links').on('hidden.bs.modal', function () {
            var count = 0;
            $(this).find('[name^=links]').each(function() { 
                count += $.trim(this.value) !== '' ? 1 : 0;
            });
            $('#link-counter').text(count + ' link' + (count !== 1 ? 's' : '') + ' added');
        });
        // Remove choice input
        $(document).on('click', '.glyphicon-remove', function () {
            $(this).closest('.form-group').remove();
        });
        // Add choice input
        $('.btn-add-choice').click(function () {
            $(this).closest('.form-group').before(function () {
                var id = _.toNumber(_.uniqueId()) + 999;
                var $new = $(this).next().clone().toggle(true);
                    $new.find('textarea').attr('name', function () {
                        return this.name.replace(/new/, id);
                    });
                    $new.find(':radio, :checkbox').val(function () {
                        return this.value.replace(/new/, id);
                    });
                return $new;
            });
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
        // Resize fields
        $('textarea').each(function () { 
            var textarea = $(this);
            if ($.trim(textarea.val()) !== '') {
                textarea.height(0).height(function () {
                    return this.scrollHeight;
                })
            }
        });
    }
});