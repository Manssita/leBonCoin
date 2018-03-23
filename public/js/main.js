$(document).ready(function() {
  $(".showTel").click(function() {
    $(this).css("display", "none");
  });

  //   $(".fav").click(function() {
  //     $(".favActive").toggleClass("none");
  //   });
  //   $(".favActive").click(function() {
  //     $(this).toggleClass("none");
  //   });
  //   $(".linkFav").click(function() {
  //     return false;
  //   });

  var url = window.location.href;
  if (url.search("professionel") >= 0) {
    $("#pro").addClass("actif");
    $("#all").removeClass("actif");
  } else if (url.search("particulier") >= 0) {
    $("#part").addClass("actif");
    $("#all").removeClass("actif");
  } else {
    $("#all").addClass("actif");
  }
});
