'use strict';

var MainController = function(uibModal) {
    var vm = this;
    vm.open = function() {
        var modalInstance = uibModal.open({
            templateUrl: '../html/info.html',
            size: 'sm'
        });

        modalInstance.result.then(function(selectedItem) {}, function() {});
    };


    vm.tabIndex = Math.floor(window.pageYOffset / $('.mySection').height());

};

MainController['$inject'] = ['$uibModal'];

angular.module('mainApp').controller('MainController', MainController);


function showWorld() {
    var myNavigation = $('#myNavigation');
    var notWorld = $('.notWorld');
    var otherContainer = $('#otherContainer');
    notWorld.toggleClass("myHidden");
    sceneManager.enableControls(true);
}
