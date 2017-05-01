'use strict';

var updateDataService = function(key, value) {
    var elem = angular.element(document.querySelector('[ng-controller]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService[key] = value;
    elem.scope().$apply();
}

var MainController = function($scope, $rootScope, $document, $http, $interval, $timeout, $uibModal, $log, dataService) {
    $scope.dataService = dataService;

    $http({ method: 'GET', url: "../musicList" }).
    then(function(response) {
        $scope.status = response.status;
        $scope.musicList = response.data;
    }, function(response) {
        $scope.data = response.data || 'Request failed';
        $scope.status = response.status;
    });

    $scope.open = function() {
        var modalInstance = $uibModal.open({
            templateUrl: '../html/info.html',
            size: 'sm'
        });

        modalInstance.result.then(function(selectedItem) {}, function() {});
    };

    $scope.open();

    $scope.isMusicScene = function() {
        return $scope.dataService.currentScene==1;
    }

    $scope.play = function() {
        if ($scope.selected) {
            var scene = sceneManager.getCurrentScene();
            if (scene.name === "MusicScene") {
                audioManager.playSound('music/' + $scope.selected, undefined, [bind(scene.particleSystem, scene.particleSystem.onCompleteParticleSystem),bind(scene, scene.onMusicLoaded)]);
            }
        }
    }

    $scope.toggleHide = function(element) {
        var element = document.getElementById(element);
        if (element.className == 'myHidden') {
            element.className = '';
        } else {
            element.className = 'myHidden';
        }
    }

    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 27: //ESC
                $scope.open();
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


angular.module('mainApp').controller('MainController', MainController);
