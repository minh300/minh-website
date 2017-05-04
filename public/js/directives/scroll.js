app.directive("scroll", function($window) {
    return function($scope, element, attrs) {
        var sectionHeight = $("#home")[0].offsetHeight;

        angular.element($window).bind("scroll", function() {
            $scope.tabIndex = Math.floor(this.pageYOffset / sectionHeight);
            $scope.$apply();
        });
    };
});

