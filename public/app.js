`use strict`;
$(document).ready(function () {
    $('#update_form').hide();
    $('#update_btn').on('click', function () {
        $('#update_form').toggle();
    });
    $('h2').text('textString');
});
