var app = angular.module('mainApp', ['ui.bootstrap']);

app.factory('dataService', function() {
    return {
        currentScene: 1,
        currentSong: ""
    };
});

$(document).ready(function() {
    $(".navbar-inverse ul li a").click(function(event) {
        // Removes focus of the anchor link.
        $(this).blur();
    });
});