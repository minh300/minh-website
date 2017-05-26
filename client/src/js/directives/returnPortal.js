angular.module('directives.returnPortal', []).directive("returnPortal", function() {
    var foreGround = $('.foreGround');
    var fgContainer = $('#fgContainer');
    return {
        link: function($scope, element, attrs) {


            function hideWorld() {
                foreGround.removeClass('myHidden');
                element.addClass('hidden');
                //this is needed since height isnt set when its hidden
                fgContainer.height(window.innerHeight - 42); //42 is constant size of navigation panel
                sceneManager.enableControls(false);
                var transitionTo = sceneManager.animateTransition ? sceneManager.sceneB.id : sceneManager.getCurrentScene().id;
                if (transitionTo > 2) {
                    transitionTo = 0;
                }

                scrollToIndex(transitionTo)();
            }
            element.on("click", hideWorld);

            $scope.$on('$destroy', function() {
                element.off('click', hideWorld);
            });
        }
    };
});
