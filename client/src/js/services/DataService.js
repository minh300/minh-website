angular.module('app').factory('dataService', ['$rootScope','$uibModal', function($rootScope,$uibModal) {

    var dataService = {};
    dataService.currentScene = 0;
    dataService.currentSong = "";
    dataService.openInfo = function() {
        var modalInstance = $uibModal.open({
            templateUrl: '../html/templates/info.tpl.html',
            size: 'sm'
        });

        modalInstance.result.then(function(selectedItem) {}, function() {});
    };

    dataService.update = function(key, value) {
        dataService[key] = value;
        $rootScope.$apply();
    }

    return dataService;
}]);
