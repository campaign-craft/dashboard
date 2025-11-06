$(document).ready(function() {

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

        // s preload
        if ($(window).load(function() {
            $("#preloader").delay(500).fadeOut("slow", function() {
                $(this).remove()
            })
        }));
});

// horizontal drag 
var instance = $(".hs__wrapper");
$.each(instance, function(key, value) {

    var arrows = $(instance[key]).find(".arrow"),
        prevArrow = arrows.filter('.arrow-prev'),
        nextArrow = arrows.filter('.arrow-next'),
        box = $(instance[key]).find(".hs"),
        x = 0,
        mx = 0,
        maxScrollWidth = box[0].scrollWidth - box[0].clientWidth / 2 - box.width() / 2;

    $(arrows).on('click', function() {

        if ($(this).hasClass("arrow-next")) {
            x = box.width() / 2 + box.scrollLeft() - 10;
            box.animate({
                scrollLeft: x
            });

        } else {
            x = box.width() / 2 - box.scrollLeft() - 10;
            box.animate({
                scrollLeft: -x
            });

        }

    });

    $(box).on({
        mousemove: function(e) {
            var mx2 = e.pageX - this.offsetLeft;
            if (mx) this.scrollLeft = this.sx + mx - mx2;
        },
        mousedown: function(e) {
            this.sx = this.scrollLeft;
            mx = e.pageX - this.offsetLeft;
        },
        scroll: function() {
            toggleArrows();
        }
    });


    $(document).on("mouseup", function() {
        mx = 0;
    });

    function toggleArrows() {
        if (box.scrollLeft() > maxScrollWidth - 10) {

            nextArrow.addClass('disabled');
        } else if (box.scrollLeft() < 10) {

            prevArrow.addClass('disabled');
        } else {

            nextArrow.removeClass('disabled');
            prevArrow.removeClass('disabled');
        }
    }
});

$('[open-modal]').on('click', function() {
    var id = $(this).attr('open-modal');
    $('.modal#' + id).addClass('active');
});

$('[close-modal]').on('click', function() {
    $(this).parents('.modal').removeClass('active');
});

$('.modal').on('click', function(e) {
    if (e.target !== this) { return };
    $(this).removeClass('active');
});
// tab

// parallax scroll
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
// e parallax

// tab
function openTab(evt, tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => {
      c.classList.remove('active');
      void c.offsetWidth; 
    });
  
    const buttons = document.querySelectorAll('.tab-buttons button');
    buttons.forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
  }


  // paralax hover
// const tl = gsap.timeline({
//     scrollTrigger: {
//         trigger: "#hero",
//         start: "top top",
//         end: "bottom top",
//         scrub: true
//     }
// });
// gsap.utils.toArray(".parallax").forEach(layer => {
//     const depth = layer.dataset.depth;
//     const movement = -(layer.offsetHeight * depth);
//     tl.to(layer, {
//         y: movement,
//         ease: "none"
//     }, 0);
// });

// var b = document.getElementsByTagName("BODY")[0];
// b.addEventListener("mousemove", function(event) {
//     parallaxed(event);
// });

// function parallaxed(e) {
//     var amountMovedX = (e.clientX * -0.3 / 8);
//     var amountMovedY = (e.clientY * -0.3 / 8);
//     var x = document.getElementsByClassName("parallaxed");
//     var i;
//     for (i = 0; i < x.length; i++) {
//         x[i].style.transform = 'translate(' + amountMovedX + 'px,' + amountMovedY + 'px)'
//     }
// }



bodymovin
var animation = bodymovin.loadAnimation({
    container: document.getElementById('loader'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'images/loader.json',
    name: 'myAnimation',
});