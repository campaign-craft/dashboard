tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var player, firstScriptTag = document.getElementsByTagName("script")[0];

function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        width: "100%",
        videoId: "gUnHLQhqt_4",
        playerVars: {
            autoplay: 1,
            playsinline: 1,
            playlist: "gUnHLQhqt_4",
            loop: 1
        },
        events: {
            onReady: onPlayerReady
        }
    })
}

function onPlayerReady(e) {
    e.target.mute(), e.target.playVideo()
}
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const node = document.getElementById('exportable');

const build = (el, filename) => {
    $('#exportable').addClass('two-x');
    domtoimage.toJpeg(el, {
        quality: .9
    }).
    then(dataUrl => {
        var link = document.createElement('a');
        link.download = filename + '.jpg';
        link.href = dataUrl;
        link.click();
        link.remove();
        $('#exportable').removeClass('two-x');
    });
};

const updateText = (el, string) => {
    $(el).text(string);
};

const templates = () => {
    const select = $('#template');
    $.each(whitepapers, function(index, data) {
        console.log(whitepapers[index]);
        const template = '<option value="' + data.name + '">' + data.name + '</option>';
        select.add(template);
    });
};


$(() => {
    const download = $('.download');
    download.on('click', () => {
        const filename = $('#filename').val();
        const title = $('#title').val();
        const name = $('#namer').val();
        if (filename) {
            build(node, filename);
        } else {
            alert('Filename is required');
        }
    });

    $('input').each(function() {
        let elFor = $(this).attr('data-for');
        console.log(elFor);
        if (elFor) {
            $(this).on('focus', () => {
                $(elFor).addClass('focused');
            }).on('blur', () => {
                $(elFor).removeClass('focused');
            });
            $(this).on('keyup', () => {
                if ($(this).val().length > 0) {
                    updateText(elFor, $(this).val());
                } else {
                    updateText(elFor, $(this).attr('placeholder'));
                }
            });
        }
    });
});
$('input[type="text"]').on('keydown, keyup', function() {
    var timer = 0;
    var sensor_word = ['anjing', 'kontol', 'cebong', 'kampret'];
    var sensor_replace = ['an***', 'ko**', 'ce***', 'kan*'];
    clearTimeout(timer);
    var new_value = this.value;
    var new_sensor = $('#title').val();

    $.each(sensor_word, function(idx, word) {
        new_sensor = new_sensor.replace(word, '*****');
    });

    timer = setTimeout(function() {
        $('.title').text(new_sensor);
    }, 0);

});
// 
var swiper = new Swiper(".mySwiper", {
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});
// pop up
$(document).ready(function() {
    $('.image-popup').magnificPopup({
        type: 'image',
        mainClass: 'mfp-with-zoom',
        gallery: {
            enabled: true
        },

        zoom: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out',
            opener: function(openerElement) {
                return openerElement.is('img') ? openerElement : openerElement.find('img');
            }
        }
    });
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
    this.el.css('transform', 'translateY(' + -(scrollTop / this.speed) + 'px)');
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