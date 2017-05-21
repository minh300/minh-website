angular.module('directives.scrollTo', []).directive("scrollTo", function() {

    return {
        link: function($scope, element, attrs) {
            var container = $('#otherContainer'),
                scrollTo = $('#' + attrs.heading)[0];
            element.on("click", function() {
                container.animate({
                    scrollTop: scrollTo.offsetTop
                }, "slow");
            });
        }
    };
});
