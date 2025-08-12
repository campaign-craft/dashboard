// =========================================================================================
//     Company      : Digital Advertising Division - kgmedia.id | Kompas Gramedia
//     Document     : JS
//     Author       : Pramuda Angga Aditya - IOBITDEV - iobit.dev
//     Project Name : ATRBPN - Microsites
//     Date         : February 13th, 2020
// =========================================================================================

// s preload
if ($(window).load(function() {
        $("#preloader").delay(1500).fadeOut("slow", function() {
            $(this).remove()
        })
    })
)
// e preload

// s lightbox
$(function(){
    var $gallery = $('.gallery a').simpleLightbox();

    $gallery.on('show.simplelightbox', function(){
        console.log('Requested for showing');
    })
    .on('shown.simplelightbox', function(){
        console.log('Shown');
    })
    .on('close.simplelightbox', function(){
        console.log('Requested for closing');
    })
    .on('closed.simplelightbox', function(){
        console.log('Closed');
    })
    .on('change.simplelightbox', function(){
        console.log('Requested for change');
    })
    .on('next.simplelightbox', function(){
        console.log('Requested for next');
    })
    .on('prev.simplelightbox', function(){
        console.log('Requested for prev');
    })
    .on('nextImageLoaded.simplelightbox', function(){
        console.log('Next image loaded');
    })
    .on('prevImageLoaded.simplelightbox', function(){
        console.log('Prev image loaded');
    })
    .on('changed.simplelightbox', function(){
        console.log('Image changed');
    })
    .on('nextDone.simplelightbox', function(){
        console.log('Image changed to next');
    })
    .on('prevDone.simplelightbox', function(){
        console.log('Image changed to prev');
    })
    .on('error.simplelightbox', function(e){
        console.log('No image found, go to the next/prev');
        console.log(e);
    });
});
// e lightbox

// s scroll anchor
$(document).ready(function() {
    $('a[href*=#]').bind('click', function(e) {
            e.preventDefault(); // prevent hard jump, the default behavior

            var target = $(this).attr("href"); // Set the target as variable

            // perform animated scrolling by getting top-position of target-element and set it as scroll target
            $('html, body').stop().animate({
                    scrollTop: $(target).offset().top
            }, 500, function() {
                    location.hash = target; //attach the hash (#jumptarget) to the pageurl
            });

            return false;
    });
});

$(window).scroll(function() {
        var scrollDistance = $(window).scrollTop();

        // Show/hide menu on scroll
        //if (scrollDistance >= 850) {
        //		$('nav').fadeIn("fast");
        //} else {
        //		$('nav').fadeOut("fast");
        //}
    
        // Assign active class to nav links while scolling
        $('.page-section').each(function(i) {
                if ($(this).position().top <= scrollDistance + 100) {
                        $('.navButton a.active').removeClass('active');
                        $('.navButton a').eq(i).addClass('active');
                }
        });
}).scroll();
// e scroll anchor 