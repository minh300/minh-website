'use strict';

var updateDataService = function(key, value) {
    var elem = angular.element(document.querySelector('[ng-controller="WorldController"]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService[key] = value;
    elem.scope().$apply();
}

var WorldController = function($scope, $rootScope, $document, $http, $interval, $timeout, $uibModal, $log, dataService) {
    $scope.dataService = dataService;

    $http({ method: 'GET', url: "../musicList" }).
    then(function(response) {
        $scope.status = response.status;
        $scope.musicList = response.data;
    }, function(response) {
        $scope.data = response.data || 'Request failed';
        $scope.status = response.status;
    });



    $scope.isMusicScene = function() {
        return $scope.dataService.currentScene == 1;
    }

    $scope.play = function() {
        var currentSelection = $scope.dataService.currentSong;
        if (currentSelection) {
            var scene = sceneManager.getCurrentScene();
            if (scene.name === "MusicScene") {
                var playList = $scope.musicList.slice($scope.musicList.indexOf(currentSelection) + 1);
                audioManager.playList = playList;
                audioManager.playSound('music/' + currentSelection, undefined, [bind(scene.particleSystem, scene.particleSystem.onCompleteParticleSystem), bind(scene, scene.onMusicLoaded)]);
            }
        }
    }

    $scope.toggleHide = function(element) {
        var element = document.getElementById(element);
        if (element.classList.contains("myHidden")) {
            element.classList.remove("myHidden");
            
        } else {
            element.classList.add("myHidden");
        }
    }

    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 27: //ESC
                $scope.$parent.open();
                break;
            case 81: //q
                $scope.toggleHide("visualControls");
                break;
            case 90: //z
                $scope.toggleHide("controlPanel");
                break;

        }

    };

    document.addEventListener('keyup', onKeyUp, false);

};


angular.module('mainApp').controller('WorldController', WorldController);
