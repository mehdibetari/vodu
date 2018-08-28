$(document).ready(function () {
    //Search filter
    $('#input-1').on('input', function () {
        var dptChoose = cleanString($(this).val());
        if (dptChoose == '') {
            $('div.card').each(function () {
                $(this).slideDown();
            });
        }

        $('div.card').each(function () {
            var title = cleanString($(this).find('.name').html());
            if (title.indexOf(dptChoose) > -1) {
                $(this).slideDown();
            } else {
                $(this).slideUp();
            }
        });
    });
});

function cleanString(original) {
    return original.replace(' ', '').replace(',', '').replace('.', '').replace('\'', '').toLowerCase();
}