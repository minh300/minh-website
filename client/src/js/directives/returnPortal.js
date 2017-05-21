angular.module('directives.returnPortal', []).directive("returnPortal", function() {
    var notWorld = $('.notWorld');
    var sections = ["#Home", "#About", "#Projects"];
    var container = $('#otherContainer');

    return {
        link: function($scope, element, attrs) {
            function hideWorld() {
                notWorld.removeClass('myHidden');
                element.addClass('hidden');
                //this is needed since height isnt set when its hidden
                var otherContainer = $("#otherContainer");
                container.height(window.innerHeight - 42); //42 is constant size of navigation panel
                sceneManager.enableControls(false);
                sceneManager.specialAnimate = true; //scrolls to apprioate section without activating scrolling transition
                var transitionTo = sceneManager.animateTransition ? sceneManager.sceneB.id : sceneManager.getCurrentScene().id;
                if (transitionTo > 2) {
                    transitionTo = 0;
                    sceneManager.transitionTo(transitionTo);
                }
                var scrollTo = $(sections[transitionTo])[0];
                container.animate({
                    scrollTop: scrollTo.offsetTop
                }, "slow");
            }
            element.on("click", hideWorld);

            $scope.$on('$destroy', function() {
                element.off('click', hideWorld);
            });
        }
    };
});
