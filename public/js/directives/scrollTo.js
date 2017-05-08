app.directive("scrollTo", function() {

    return {
        link: function($scope, element, attrs) {
            var container = $('html,body'),
                scrollTo = $('#' + attrs.heading);
            element.on("click", function() {
                container.animate({
                    scrollTop: scrollTo.offset().top - 100
                }, "slow");
            });
        }
    };
});
