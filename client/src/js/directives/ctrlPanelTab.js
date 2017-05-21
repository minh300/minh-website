angular.module('directives.ctrlPanelTab', []).directive("ctrlPanelTab", function() {
    return {
        link: function($scope, element, attrs) {
            function onClick() {
                toggleForId('controlPanel', "myHidden");
            }
            element.on("click", onClick);

            $scope.$on('$destroy', function() {
                element.off('click', showWorld);
            });
        }
    };
});
