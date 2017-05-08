'use strict';

var MainController = function( uibModal) {
    var vm = this;
    vm.open = function() {
        var modalInstance = uibModal.open({
            templateUrl: '../html/info.html',
            size: 'sm'
        });

        modalInstance.result.then(function(selectedItem) {}, function() {});
    };


    vm.showWorld = function() {
        var world = $('#world');
        var portal = $('#portal');
        var body = $('body');
        if (world.hasClass("hidden")) {
            body.css("overflow", "hidden");
            this.open();
            init();
            animate();
        } else {
            body.css("overflow", "visible");
        }
        world.toggleClass("hidden");
        portal.toggleClass("hidden");
    }

    vm.tabIndex = Math.floor(window.pageYOffset / $('.mySection').height());

};

MainController['$inject'] = [ '$uibModal'];

angular.module('mainApp').controller('MainController', MainController);
