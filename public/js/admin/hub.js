$(function () {
    var body = $(document.body);

    if (body.hasClass('hub-page')) {
        $('table .btn').click(function (e) {
            e.preventDefault();
            var btn = this;
            $.patch(this.href, function (res) {
                console.log(res)
            });
        });
    }
});