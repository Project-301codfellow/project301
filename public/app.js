'use strict';
//this function to applay your animate style
function animate_Me(target, moveMe) {
    $(target).focus(function () {
        $(moveMe).animate({ "marginLeft": "266px" });
    });
    $(target).focusout(function () {
        $(moveMe).animate({ "marginLeft": "24px" });
    });
}
//--------------------
animate_Me("input[type='text']", ".fa-user");
animate_Me("input[placeholder='Your Last Name']", ".fa-user-plus");
animate_Me("input[type='email']", ".fa-envelope");
animate_Me("input[type='password']", ".fa-lock");
animate_Me("input[placeholder='Confirm Password']", ".fa-refresh");
$("#login-button").click(function (event) {
    event.preventDefault();
    $('form').fadeOut(500);
    $('.wrapper').addClass('form-success');
});
