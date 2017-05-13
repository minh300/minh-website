var app = angular.module('mainApp', ['ui.bootstrap']);
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
app.factory('dataService', ['$rootScope', function($rootScope) {

    var dataService = {};
    dataService.currentScene = 0;
    dataService.currentSong = "";
    dataService.update = function(key,value) {
        dataService[key] = value;
        $rootScope.$apply();
    }

    return dataService;
}]);

$(document).ready(function() {
    $("#myNavigation li a").click(function(event) {
        // Removes focus of the anchor link.
        $(this).blur();
    });
});

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});