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
    notWorld.toggleClass('myHidden');
    sceneManager.enableControls(true); //right now its toggling
    sceneManager.specialAnimate = true;
    if (!notWorld.hasClass('myHidden')) {
        scrollTo(sceneManager.animateTransition ? sceneManager.sceneB.id : sceneManager.getCurrentScene().id);
    }

}

function scrollTo(index) {
    var sections = ["#Home", "#About", "#Projects"];
    var container = $('#otherContainer'),
        scrollTo = $(sections[index])[0];
    container.animate({
        scrollTop: scrollTo.offsetTop
    }, "slow");
}
