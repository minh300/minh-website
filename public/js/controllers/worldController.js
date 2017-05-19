'use strict';

//should move these two to an object
function updateDataService(key, value) {
    var elem = angular.element(document.querySelector('[ng-controller="WorldController as vm"]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService.update(key, value);
}

function openInfo() {
    var elem = angular.element(document.querySelector('[ng-controller="WorldController as vm"]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService.openInfo();
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
        var element = $('#' + element);
        element.toggleClass("myHidden");
    }
    vm.hideWorld = function() {
        var notWorld = $('.notWorld');
        notWorld.removeClass('myHidden');
        var returnButton = $('#returnButton');
        returnButton.addClass('hidden');
        //this is needed since height isnt set when its hidden
        var otherContainer = $("#otherContainer");
        otherContainer.height(window.innerHeight - 42); //42 is constant size of navigation panel
        sceneManager.enableControls(false);
        sceneManager.specialAnimate = true; //scrolls to apprioate section without activating scrolling transition
        var transitionTo = sceneManager.animateTransition ? sceneManager.sceneB.id : sceneManager.getCurrentScene().id;
        if (transitionTo > 2) {
            transitionTo = 0;
            sceneManager.transitionTo(transitionTo);
        }
        scrollTo(transitionTo);
    }

    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 81: //q
                vm.toggleHide("visualControls");
                break;
            case 90: //z
                vm.toggleHide("controlPanel");
                break;

        }

    };

    document.addEventListener('keyup', onKeyUp, false);

};

WorldController['$inject'] = ['$scope', '$http', 'dataService'];


angular.module('mainApp').controller('WorldController', WorldController);
