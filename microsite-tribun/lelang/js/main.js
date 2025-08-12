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

var swiper = new Swiper('.slide1', {
    spaceBetween: 1,
    slidesPerView: 1,
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
var swiper = new Swiper('.slide3', {
    spaceBetween: 1,
    slidesPerView: 2.5,
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
var swiper = new Swiper('.slide4', {
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
// s parallax
$.fn.moveIt = function() {
    var $window = $(window);
    var instances = [];

    $(this).each(function() {
        instances.push(new moveItItem($(this)));
    });

    window.addEventListener('scroll', function() {
        var scrollTop = $window.scrollTop();
        instances.forEach(function(inst) {
            inst.update(scrollTop);
        });
    }, { passive: true });
}

var moveItItem = function(el) {
    this.el = $(el);
    this.speed = parseInt(this.el.attr('data-scroll-speed'));
};

moveItItem.prototype.update = function(scrollTop) {
    this.el.css('transform', 'translateY(' + (scrollTop / this.speed) + 'px)');
};

$(function() {
    $('[data-scroll-speed]').moveIt();
});

$(window).scroll(function() {
    var scrollTop = $(window).scrollTop();
    console.log("scrollTop>>>" + scrollTop);
    if (scrollTop == 0) {
        $("#scrollFx").css({ "bottom": "-1000px" });
    } else {
        $("#scrollFx").css({ "bottom": ($(window).scrollTop()) + "px" });
    }
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
(function() {
    var _class = "FormSelect";
    if (!window || window[_class]) return;
    window[_class] = function(parent, options) {
        this._parent = parent;
        this._options = options;
        this._list = document.createElement("ul");
        this._input = null;
        this._select = null;
        this._index = 0;
        this._onClick = this._onClick.bind(this);
        this._onDone = this._onDone.bind(this);
        this._setActive = this._setActive.bind(this);
        this._init();
    };
    window[_class].prototype = {
        constructor: window[_class],
        _init: function() {
            if (typeof this._parent === "object") {
                this._input = this._parent.querySelector("input");
                this._select = this._parent.querySelector("select");
                this._index = this._select.selectedIndex || 0;

                if (this._input && this._select) {
                    for (var i = 0; i < this._select.options.length; ++i) {
                        var li = document.createElement("li");
                        li.setAttribute("data-index", i);
                        li.addEventListener("click", this._onClick);
                        li.innerHTML = this._select.options[i].innerHTML || "...";
                        li.className = (this._index === i) ? "active" : "";
                        this._list.appendChild(li);
                    }
                    this._parent.appendChild(this._list);
                    this._setActive();
                }
            }
        },
        _onClick: function(e) {
            this._index = e.target.getAttribute("data-index") || 0;
            this._setActive(this._index);
            setTimeout(this._onDone, 60);
        },
        _onDone: function() {
            this._parent.blur();
            this._input.blur();
        },
        _setActive: function(index) {
            index = (index || index === 0) ? index : this._select.selectedIndex;

            var active = this._list.querySelector(".active");
            if (active) active.className = "";

            this._select.selectedIndex = index;
            this._input.value = this._select.options[index].innerHTML || "";
            this._list.children[index].className = "active";
        },
    };

})();

var items = document.querySelectorAll("form .select");

for (var i = 0; i < items.length; i++) {
    new FormSelect(items[i]);
}

tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var player, firstScriptTag = document.getElementsByTagName("script")[0];

function onYouTubeIframeAPIReady() { player = new YT.Player("player", { width: "100%", videoId: "vr9PNIigiG4", playerVars: { autoplay: 0, playsinline: 1, playlist: "vr9PNIigiG4", loop: 1 }, events: { onReady: onPlayerReady } }) }

function onPlayerReady(e) { e.target.mute(), e.target.playVideo() }
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);