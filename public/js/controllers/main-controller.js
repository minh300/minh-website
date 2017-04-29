'use strict';

var updateDataService = function(key, value) {
    var elem = angular.element(document.querySelector('[ng-controller]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService[key] = value;
    elem.scope().$apply();
}

var MainController = function($scope, $rootScope, $document, $http, $interval, $timeout, dataService) {

    $http({ method: 'GET', url: "../musicList" }).
    then(function(response) {
        $scope.status = response.status;
        $scope.musicList = response.data;
    }, function(response) {
        $scope.data = response.data || 'Request failed';
        $scope.status = response.status;
    });

    $scope.play = function() {
        var scene = scenes[1].scene;
        var visuals = ["staff", "heart", "spiral", "fountain", "flower"];
        var selectedObject;
        for (var i = 0; i < visuals.length; i++) {
            selectedObject = scene.getObjectByName(visuals[i]);
            scene.remove(selectedObject);
        }

        selectedObject = scene.getObjectByName("particleSystem");
        scene.remove(selectedObject);

        audioManager.playSound('music/' + $scope.selected, undefined, [bind(scenes[1].particleSystem, scenes[1].particleSystem.onCompleteParticleSystem), bind(scenes[1], scenes[1].onCompleteCircles)]);
    }

    $scope.toggleHide = function(element) {
        var element = document.getElementById(element);
        if (element.className == 'hidden') {
            element.className = '';
        } else {
            element.className = 'hidden';
        }
    }

    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 81: //q
                $scope.toggleHide("visualControls");
                break;
            case 90: //z
                $scope.toggleHide("controlPanel");
                break;
        }

    };

    document.addEventListener('keyup', onKeyUp, false);

    $scope.dataService = dataService;
};

angular.module('mainApp').controller('MainController', MainController);
