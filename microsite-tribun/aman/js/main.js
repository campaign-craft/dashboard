$(document).ready(function() {

    // Toggle menu on click
    $("#menu-toggler").click(function() {
        toggleBodyClass("menu-active");
    });
    $(".menu-item").click(function() {
        toggleBodyClass("menu-active");
    });

    $(".nav__link").click(function() {
        $("body.menu-active").removeClass("menu-active");
    });
    $("#close1").click(function() {
        $("body.menu-active").removeClass("menu-active");
    });
    $("#close2").click(function() {
        $("body.menu-active").removeClass("menu-active");
    });
    $("#close3").click(function() {
        $("body.menu-active").removeClass("menu-active");
    });
    $("#close4").click(function() {
        $("body.menu-active").removeClass("menu-active");
    });
    $("#close5").click(function() {
        $("body.menu-active").removeClass("menu-active");
    });


    function toggleBodyClass(className) {
        document.body.classList.toggle(className);
    }

    // nav fixed
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 150) {
            $(".header").addClass("fixshow");
            $(".about").addClass("spacetop");
        } else {
            $(".header").removeClass("fixshow");
            $(".about").removeClass("spacetop");
        }
    });

    $('.icon-sosmed').click(function() {
        if ($('.social').hasClass('social-show')) {
            $('.social').removeClass('social-show');
        } else {
            $('.social').addClass('social-show');
        }
    });

    // s backtotop
    var toggleHeight = $(window).outerHeight() * 0.5;

    $(window).scroll(function() {
        if ($(window).scrollTop() > toggleHeight) {
            $(".m-backtotop").addClass("active");
        } else {
            $(".m-backtotop").removeClass("active");
        }
    });

    $(".m-backtotop").click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, "slow");
        return false;
    });

});

var $swiper = $(".slide1");
var $bottomSlide = null;
var $bottomSlideContent = null;

var mySwiper = new Swiper(".slide1", {
    spaceBetween: 1,
    slidesPerView: 3,
    centeredSlides: true,
    roundLengths: true,
    loop: true,
    loopAdditionalSlides: 30,
    speed: 1000,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
// 2
var swiper = new Swiper('.slide2', {
    loop: true,
    pagination: ".swiper-pagination",
    paginationClickable: true,
    effect: "slide",
    spaceBetween: 30,
    speed: 1000,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

});

// tab 
(function($) {
    const $tabLink = $('#tabs-section .tab-link');
    const $tabBody = $('#tabs-section .tab-body');
    let timerOpacity;
    const init = () => {
        $tabLink.off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.clearTimeout(timerOpacity);
            $tabLink.removeClass('active-tab ');
            $tabBody.removeClass('active-tab ');
            $tabBody.removeClass('active-content');
            $(this).addClass('active-tab');
            $($(this).attr('href')).addClass('active-tab');
            timerOpacity = setTimeout(() => {
                $($(this).attr('href')).addClass('active-content');
            }, 50);
        });
    };
    $(function() {
        init();
    });
})(jQuery);

// pagination
jQuery(function($) {
    var items = $("#content div.card");
    var numItems = items.length;
    var perPage = 6;
    items.slice(perPage).hide();

    $(".pagination-vip").pagination({
        items: numItems,
        itemsOnPage: perPage,
        cssStyle: "custom-theme",

        onPageClick: function(pageNumber) {
            var showFrom = perPage * (pageNumber - 1);
            var showTo = showFrom + perPage;
            items.hide()
                .slice(showFrom, showTo).show();
        }
    });

});