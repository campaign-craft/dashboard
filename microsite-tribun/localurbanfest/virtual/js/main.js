$(document).ready(function() {

    if ($(window).load(function() {
            $(".box-preload__bg").delay(3500).fadeOut("slow", function() {
                $(this).remove()
            })
        }));

});
$('[open-modal]').on('click', function() {
    var id = $(this).attr('open-modal');
    $('.modal#' + id).addClass('active');
});

$('[close-modal]').on('click', function() {
    $(this).parents('.modal').removeClass('active');
});

$('.modal').on('click', function(e) {
    if (e.target !== this) {
        return
    };
    $(this).removeClass('active');
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow1'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow2'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow3'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow4'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow5'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow6'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow7'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow8'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow11'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow12'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('arrow13'),
    path: 'img/arrow.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('info-1'),
    path: 'img/info.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('info-2'),
    path: 'img/info.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('info-3'),
    path: 'img/info.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});
var animation = bodymovin.loadAnimation({

    container: document.getElementById('info-4'),
    path: 'img/info.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
    name: "Demo Animation",
});



var pause = document.querySelector(".pause");
var audio = document.querySelector(".audio");

function togglePlay() {
    if (audio.paused) {
        audio.play();
        pause.innerHTML = "<img src='img/sound-x.png'>";
    } else {
        audio.pause();
        pause.innerHTML = "<img src='img/sound.png'>";
        pause.style.color = " #848484";
    }
}
$('.box-preload button').click(function() {
    $(this).hide();
    $('.box-preload').hide();
});


$(document).ready(function() {
    autoPlayYouTubeModal();
});

function autoPlayYouTubeModal() {
    var triggerOpen = $("body").find('[data-tagVideo]');
    triggerOpen.click(function() {
        var theModal = $(this).data("bs-target"),
            videoSRC = $(this).attr("data-tagVideo"),
            videoSRCauto = videoSRC + "?autoplay=1";
        $(theModal + ' iframe').attr('src', videoSRCauto);
        $(theModal + ' button.modal-close').click(function() {
            $(theModal + ' iframe').attr('src', videoSRC);
        });
        $(theModal + ' .modal-overlay').click(function() {
            $(theModal + ' iframe').attr('src', videoSRC);
        });
    });

}


$('.modal-toggle').on('click', function(e) {
    e.preventDefault();
    $('.modal-video').toggleClass('is-visible');
});