var app = angular.module('mainApp', ['ui.bootstrap']);
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
app.factory('dataService', ['$rootScope', function($rootScope) {

    var dataService = {};
    dataService.currentScene = 1;
    dataService.currentSong = "";
    dataService.update = function(key,value) {
        dataService[key] = value;
        $rootScope.$apply();
    }

    return dataService;
}]);

$(document).ready(function() {
    $(".navbar-inverse ul li a").click(function(event) {
        // Removes focus of the anchor link.
        $(this).blur();
    });
});
