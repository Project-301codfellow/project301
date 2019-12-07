$(function () {
    $('.acc_ctrl').on('click', function (e) {
        e.preventDefault();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).next()
                .stop()
                .slideUp(300);
        } else {
            $(this).addClass('active');
            $(this).next()
                .stop()
                .slideDown(300);
        }
    });
});
$(document).ready(function () {
    $(".ham").click(function () {
        $(this).toggleClass("active");
    });
    (function () {
        var button,
            delay,
            clickRipple;
        button = document.getElementById('button19');
        delay = function (t, f) {
            return setTimeout(f, t);
        };
        clickRipple = function (x, y, d) {
            var cell,
                decay;
            cell = document.createElement('div');
            cell.className = 'clickRipple';
            cell.style.left = x + 'px';
            cell.style.top = y + 'px';
            cell.style.height = d + 'px';
            cell.style.width = d + 'px';
            decay = delay(280, function () {
                return button.removeChild(cell);
            });
            return cell;
        };
        button.addEventListener('click', function (e) {
            var offset,
                rect,
                x,
                y;
            rect = this.getBoundingClientRect();
            offset = this.offsetWidth;
            x = e.clientX - rect.left - offset;
            y = e.clientY - rect.top - offset;
            return this.appendChild(clickRipple(x, y, offset * 2));
        });
    }.call(this));
});