angular.module('directives.scrollTo', []).directive("scrollTo", function() {
    return {
        link: function($scope, element, attrs) {
            var fgContainer = $('#fgContainer');
            element.on("click", scrollToIndex(fgContainer, attrs.index));
        }
    };
});

function scrollToIndex(container, index) {
    var sections = ["#Home", "#About", "#Projects"];

    var scrollTo = $(sections[index])[0];

    return function() {
        sceneManager.specialAnimate = true; //scrolls to apprioate section without activating scrolling transition
        sceneManager.transitionTo(index);

        container.animate({
            scrollTop: scrollTo.offsetTop
        }, 750);
    }
}
