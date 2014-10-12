'use strict';

angular.module('tripStoryApp.exploreprofile', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/exploreprofile/:userId', {
    templateUrl: '/static/js/exploreprofile/exploreprofile.html',
    controller: 'ExploreController as exploreCtr'
  });
  $routeProvider.when('/exploreprofile', {
    templateUrl: '/static/js/exploreprofile/exploreprofile.html',
    controller: 'ExploreController as exploreCtr'
  });
}]);

