angular.module('app', ['ui.bootstrap', 'directives.portal', 'directives.returnPortal', 'directives.scroll', 'directives.scrollTo', 'directives.ctrlPanelTab', 'templates.app', ]);

angular.module('app').config(['$compileProvider', function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

var mainController = function(http, dataService) {
    var vm = this;

    vm.dataService = dataService;

    vm.tabIndex = Math.floor(window.pageYOffset / $('.mySection').height());
    
    vm.loadMuslicList = function() {
        http({ method: 'GET', url: "../musicList" }).
        then(function(response) {
            vm.musicList = response.data;
        }, function(response) {
            console.log("Unable to get music list");
        });
    };

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
    };


};

mainController['$inject'] = ['$http', 'dataService'];

angular.module('app').controller('MainController', mainController);


$(document).ready(function() {
    $("#myNavigation li a").click(function(event) {
        // Removes focus of the anchor link.
        $(this).blur();
    });

    //world
    initWorld();
});


function toggleForId(id, className) {
    var element = $('#' + id);
    element.toggleClass(className);
}
