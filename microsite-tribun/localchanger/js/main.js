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


    function toggleBodyClass(className) {
        document.body.classList.toggle(className);
    }

    // nav
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 50) {
            $(".header").addClass("fixshow");
            $(".main").addClass("spacetop");
        } else {
            $(".header").removeClass("fixshow");
            $(".main").removeClass("spacetop");
        }
    });
    // back to top

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
    // e backtotop

    // alert selesai

    window.pressed = function() {
        var a = document.getElementById('file');
        if (a.value == "") {
            fileLabel.innerHTML = "Choose file";
        } else {
            var theSplit = a.value.split('\\');
            fileLabel.innerHTML = theSplit[theSplit.length - 1];
        }
    };
    $("#file").change(function() {
        filename = this.files[0].name
        console.log(filename);
    });
    // swiper 2

});
var swiper = new Swiper('.slide2', {
    loop: true,
    pagination: ".swiper-pagination",
    speed: 1500,
    paginationClickable: true,
    autoplay: true,
    effect: "slide",
    spaceBetween: 30,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination'
    },

});