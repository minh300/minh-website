'use strict';

var updateDataService = function(key, value) {
    var elem = angular.element(document.querySelector('[ng-controller="WorldController as vm"]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService.update(key,value);
}


var WorldController = function(scope, http, dataService) {
    var parentVm = scope.$parent.vm;
    var vm = this;
    vm.dataService = dataService;

    http({ method: 'GET', url: "../musicList" }).
    then(function(response) {
        vm.musicList = response.data;
    }, function(response) {
        vm.data = response.data || 'Request failed';
    });



    vm.isMusicScene = function() {
        return this.dataService.currentScene == 1;
    }

    vm.play = function() {
        var currentSelection = this.dataService.currentSong;
        if (currentSelection) {
            var scene = sceneManager.getCurrentScene();
            if (scene.name === "MusicScene") {
                var playList = this.musicList.slice(this.musicList.indexOf(currentSelection) + 1);
                audioManager.playList = playList;
                audioManager.playSound('music/' + currentSelection, undefined, [bind(scene.particleSystem, scene.particleSystem.onCompleteParticleSystem), bind(scene, scene.onMusicLoaded)]);
            }
        }
    }

    vm.toggleHide = function(element) {
        var element = $('#'+element);
        element.toggleClass("myHidden");
    }

    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 27: //ESC
                parentVm.open();
                break;
            case 81: //q
                vm.toggleHide("visualControls");
                vm.toggleHide("controlPanel");
                break;
            case 90: //z
               // vm.toggleHide("controlPanel");
               showWorld();
                break;

        }

    };

    document.addEventListener('keyup', onKeyUp, false);

};

WorldController['$inject'] = [ '$scope', '$http', 'dataService'];


angular.module('mainApp').controller('WorldController', WorldController);
