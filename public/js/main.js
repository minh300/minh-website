var app = angular.module('mainApp', ['ui.bootstrap']);
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
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