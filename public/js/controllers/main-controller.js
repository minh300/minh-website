'use strict';

var updateDataService = function(currentScene) {
    var elem = angular.element(document.querySelector('[ng-controller]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService.currentScene = currentScene;
    elem.scope().$apply();
}

var MainController = function($scope, $rootScope, $document, $http, dataService) {

    $http({ method: 'GET', url: "../musicList" }).
    then(function(response) {
        $scope.status = response.status;
        $scope.musicList = response.data;
    }, function(response) {
        $scope.data = response.data || 'Request failed';
        $scope.status = response.status;
    });

    $scope.showSongs = false;

    $scope.play = function() {
        var scene = scenes[1].scene;
        //  var selectedObject = scene.getObjectByName("outterCircle");
        //  scene.remove(selectedObject);
        var selectedObject = scene.getObjectByName("innerCircle");
        scene.remove(selectedObject);
        selectedObject = scene.getObjectByName("particleSystem");
        scene.remove(selectedObject);
        audioManager.playSound('music/' + $scope.selected, undefined, [bind(scenes[1].particleSystem, scenes[1].particleSystem.onCompleteParticleSystem), bind(scenes[1], scenes[1].onCompleteCircles)]);
    }

    $scope.dataService = dataService;
};

angular.module('mainApp').controller('MainController', MainController);
