var app = angular.module('mainApp', ['ui.bootstrap']);

app.factory('dataService', function() {
    return {
        currentScene: sceneManager.currentScene
    };
});
