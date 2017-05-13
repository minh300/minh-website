app.directive("scroll", function() {
    return {
        link: function($scope, element, attrs) {
            var vm = $scope.vm;
            var scrollContainer = $('#otherContainer');
            var sections = ["#Home .myTitle", "#About .myTitle", "#Projects .myTitle"];
            var onScroll = function() {
                var sectionHeight = $('.mySection').height();//needs to be here because of resizing
                var newIndex = Math.floor((scrollContainer[0].scrollTop + sectionHeight / 3) / sectionHeight);
                if (newIndex != vm.tabIndex) {
                    //  $(sections[newIndex]).animateCss('slideInLeft');

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
