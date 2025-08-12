// =========================================================================================
//     Company      : Digital Advertising Division - kgmedia.id | Kompas Gramedia
//     Document     : JS
//     Author       : Pramuda Angga Aditya - IOBITDEV - iobit.dev
//     Project Name : ATRBPN - Microsites
//     Date         : February 13th, 2020
// =========================================================================================

// s hero slider
var swiper = new Swiper('.swiper-container', {
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
});
// e hero slider

// s narrow nav scroll
(function($) {          
    $(document).ready(function(){                    
        $(window).scroll(function(){                          
            if ($(this).scrollTop() > 300) {
                $('.navMenu').addClass("navMenu__fixed");
            } else {
                $('.navMenu').removeClass("navMenu__fixed");
            }
        });
    });
})(jQuery);
// e narrow nav scroll  

// s narrow nav open
$('#toggle').click(function() {
    $(this).toggleClass('active');
    $('#overlay').toggleClass('open');
});
$('.overlay-menu a').click(function() {
    $('.button_container').removeClass('active');
    $('#overlay').toggleClass('open');
});
// e narrow nav open