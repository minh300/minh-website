'use strict';

var MainController = function() {
    var vm = this;


    vm.tabIndex = Math.floor(window.pageYOffset / $('.mySection').height());


};


angular.module('mainApp').controller('MainController', MainController);

function scrollTo(index) {
    var sections = ["#Home", "#About", "#Projects"];
    var container = $('#otherContainer'),
        scrollTo = $(sections[index])[0];
    container.animate({
        scrollTop: scrollTo.offsetTop
    }, "slow");
}
