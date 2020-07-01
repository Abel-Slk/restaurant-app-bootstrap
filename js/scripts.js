   // Some Bootstrap stuff can be controlled both using data-* attributes and JS (Jquery) - ex carousel. See complete description of both ways at https://www.w3schools.com/bootstrap4/bootstrap_ref_js_carousel.asp

   $(document).ready(function() {
    $("#mycarousel").carousel({ interval: 2000}); // making it faster (the default is 5 sec)
    // carousel() is a Bootstrap JS method
    
    $("#carouselButton").click(function() {
        if ($("#carouselButton").children("span").hasClass("fa-pause")) { //check if the #carouselButton el has any <span> el inside, and if the span tag has the fa-pause class, then we know that this button is currently acting as the pause button
            $("#mycarousel").carousel("pause");
            $("#carouselButton").children("span").removeClass("fa-pause");
            $("#carouselButton").children("span").addClass("fa-play");
        }
        else if ($("#carouselButton").children("span").hasClass("fa-play")) { //if is not necessary here, cause there are only two options ("it's here just for my reassurance")
            $("#mycarousel").carousel("cycle");
            $("#carouselButton").children("span").removeClass("fa-play");
            $("#carouselButton").children("span").addClass("fa-pause");

        }
        
    });


    $("#loginModalButton").click(function() {
        $("#loginModal").modal(); // or modal("toggle") - it does the same
    });
    $("#reservationModalButton").click(function() {
        $("#reservationModal").modal();
    });

});