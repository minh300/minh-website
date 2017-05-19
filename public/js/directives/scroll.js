app.directive("scroll", function() {
    return {
        link: function($scope, element, attrs) {
            var vm = $scope.vm;
            var scrollContainer = element;
            var sections = ["#Home", "#About", "#Projects"];
            var onScroll = function() {
                var sectionHeight = $('.mySection').height(); //needs to be here because of resizing
                var newIndex = Math.floor((scrollContainer[0].scrollTop + sectionHeight / 4) / sectionHeight);

                if (newIndex != vm.tabIndex) {
                    vm.tabIndex = newIndex;
                    sceneManager.transitionTo(newIndex);
                    $scope.$apply();
                }

            };
            scrollContainer.on("scroll", onScroll);

            $scope.$on('$destroy', function() {
                scrollContainer.off('scroll', onScroll);
            });
        }
    };
});
