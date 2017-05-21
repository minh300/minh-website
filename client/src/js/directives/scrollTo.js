angular.module('directives.scrollTo', []).directive("scrollTo", function() {

    return {
        link: function($scope, element, attrs) {
            var fgContainer = $('#fgContainer'),
                scrollTo = $('#' + attrs.heading)[0];
            element.on("click", function() {
                fgContainer.animate({
                    scrollTop: scrollTo.offsetTop
                }, "slow");
            });
        }
    };
});
