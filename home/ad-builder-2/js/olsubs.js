$(window).load(function() {
  $("body > div:not('.ol_container')").wrapAll("<div class='wrap__container'></div>");

  $(".ol_container").show();

  var olBigHtmlHeight = 480;

  $(".ol_container").css("height", olBigHtmlHeight + "px");
  // iframeSmall.css("height", olSmallImgHeight + "px");

  $(".wrap__container").css("top", olBigHtmlHeight + "px");
  // $(".ol_small").css("top", -olSmallImgHeight + "px");

  $(".ol_close_ad").click(function() {
    $(".ol_close_ad").hide();
    $(".wrap__container").animate({ top: 0 + "px" }, 200);
    // $(".ol_small").animate({ top: "0" }, 200);
    $(".ol_big").animate({ top: 0 + "px" }, 200);
    $(".ol_container").animate({ height: 0 + "px" }, 200);
    setTimeout(function() {
      $(".ol_big").css("display", "none");
    }, 200);
  });

  $(window).scroll(function() {
    var getHeight = $(".ol_container").height();
    if ($(window).scrollTop() > getHeight) {
      $(".theader").css("position", "fixed");
      $(".wrap__container").css("top", "0px");
    } else {
      $(".theader").css("position", "relative");
      $(".wrap__container").css("top", "480px");
    }
  });

  $(window).scrollTop(0);
});
