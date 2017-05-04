'use strict';

var MainController = function($scope, $rootScope, $document, $http, $interval, $timeout, $uibModal, $log) {

    $scope.open = function() {
        var modalInstance = $uibModal.open({
            templateUrl: '../html/info.html',
            size: 'sm'
        });

        modalInstance.result.then(function(selectedItem) {}, function() {});
    };


    $scope.showWorld = function() {
        var world = $('#world');
        var portal = $('#portal');
        var body = $('body');
        if (world.hasClass("hidden")) {
            body.css("overflow", "hidden");
            $scope.open();
        } else {
            body.css("overflow", "visible");
        }
        world.toggleClass("hidden");
        portal.toggleClass("hidden");
    }


    $scope.scrollTo = function(id, $event) {
        var container = $('html,body'),
            scrollTo = $('#' + id);
        container.animate({
            scrollTop: scrollTo.offset().top - 100
        }, "slow");

    }
};


angular.module('mainApp').controller('MainController', MainController);
