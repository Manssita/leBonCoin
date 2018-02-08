$(document).ready(function(){

    $(".showTel").click(function(){
        $(this).css("display", "none");
    });

    var url = window.location.href
    $(function() {
        if ( url.search('professionel') >= 0 ) {
            $('#pro').addClass("active");
            $('#all').removeClass("active")
        }
        if ( url.search('particulier') >= 0 ) {
            $('#part').addClass("active");
            $('#all').removeClass("active")
        }
    });
});
