angular.module('app', ['ui.bootstrap', 'directives.portal', 'directives.returnPortal', 'directives.scroll', 'directives.scrollTo', 'templates.app', ]);

angular.module('app').config(['$compileProvider', function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

var mainController = function(http, dataService) {
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
        toggleForId(element, "myHidden");
    }

    var onKeyUp = function(event) {
        switch (event.keyCode) {
            case 81: //q
                toggleForId("visualControls", "myHidden");
                break;
            case 90: //z
                toggleForId("controlPanel", "myHidden");
                break;

        }

    };

    $(document).on('keyup', onKeyUp);
    vm.tabIndex = Math.floor(window.pageYOffset / $('.mySection').height());


};

mainController['$inject'] = ['$http', 'dataService'];

angular.module('app').controller('MainController', mainController);


$(document).ready(function() {
    $("#myNavigation li a").click(function(event) {
        // Removes focus of the anchor link.
        $(this).blur();
    });

    //world
    init();
    animate();
});


//lets you animate and turn clenas it up, look at animate.css
$.fn.extend({
    animateCss: function(animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});


//should move these two to an object
function updateDataService(key, value) {
    var elem = angular.element(document.querySelector('[ng-controller="MainController as vm"]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService.update(key, value);
}

function openInfo() {
    var elem = angular.element(document.querySelector('[ng-controller="MainController as vm"]'));
    var injector = elem.injector();
    var myService = injector.get('dataService');
    myService.openInfo();
}

function toggleForId(id, className) {
    var element = $('#' + id);
    element.toggleClass(className);
}
