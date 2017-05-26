angular.module('directives.scroll', []).directive("scroll", function() {
    return {
        link: function($scope, element, attrs) {
            var vm = $scope.vm;
            var onScroll = function() {
                var sectionHeight = $('.mySection').height(); //needs to be here because of resizing
                var newIndex = Math.floor((element[0].scrollTop) / sectionHeight);

                if (newIndex != vm.tabIndex) {
                    vm.tabIndex = newIndex;
                    if (!sceneManager.specialAnimate) {
                        sceneManager.transitionTo(newIndex);
                    }
                    $scope.$apply();
                }

            };
            element.on("scroll", onScroll);

            $scope.$on('$destroy', function() {
                element.off('scroll', onScroll);
            });
        }
    };
});
