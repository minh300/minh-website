angular.module('directives.scrollTo', []).directive("scrollTo", function() {
    return {
        link: function($scope, element, attrs) {
            var onClick = scrollToIndex(attrs.index);
            element.on("click", onClick);

            $scope.$on('$destroy', function() {
                element.off('click', onClick);
            });
        }
    };
});

function scrollToIndex( index) {
    var fgContainer = $('#fgContainer');

    var sections = ["#Home", "#About", "#Projects"];

    var scrollTo = $(sections[index])[0];

    return function() {
        sceneManager.specialAnimate = true; //scrolls to apprioate section without activating scrolling transition
        sceneManager.transitionTo(index);

        fgContainer.animate({
            scrollTop: scrollTo.offsetTop
        }, 750);
    }
}
