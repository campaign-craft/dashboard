$(document).ready(function() {
    // click target nav
    $('a[href^="#"]').bind('click.smoothscroll', function(e) {
        e.preventDefault();
        var target = this.hash,
            $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 500, 'swing', function() {
            window.location.hash = target;
        });
    });
});

// e scroll anchor
$(window).scroll(function() {
    var scrollDistance = $(window).scrollTop();
    $('.page-section').each(function(i) {
        if ($(this).position().top <= scrollDistance + 200) {
            $('.nav-menu a.active1').removeClass('active1');
            $('.nav-menu a').eq(i).addClass('active1');
        }
    });
}).scroll();