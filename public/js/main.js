var app = angular.module('mainApp', [
	'angular-scroll-animate'
]);

app.factory('dataService', function(){
  return {
    currentScene: 0
  };
});