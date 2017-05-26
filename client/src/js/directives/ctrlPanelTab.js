angular.module('directives.ctrlPanelTab', []).directive("ctrlPanelTab", function() {
    function onClick() {
        toggleForId('controlPanel', "myHidden");
    }
    return {
        link: function($scope, element, attrs) {

            element.on("click", onClick);

            $scope.$on('$destroy', function() {
                element.off('click', onClick);
            });
        }
    };
});
