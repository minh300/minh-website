app.directive("scroll", ['$window', function($window) {
    return {
        link: function($scope, element, attrs) {
            var vm = $scope.vm;
            var onScroll = function() {
                var sectionHeight = $('.mySection').height();
                var newIndex = Math.floor(this.pageYOffset / sectionHeight);

                if (newIndex != vm.tabIndex) {
                    vm.tabIndex = newIndex;
                    $scope.$apply();
                }
            };

            angular.element($window).on("scroll", onScroll);

            $scope.$on('$destroy', function() {
                angular.element($window).off('scroll', onScroll);
            });
        }
    };
}]);
