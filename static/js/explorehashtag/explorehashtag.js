'use strict';

angular.module('tripStoryApp.explorehashtag', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/explorehashtag/:hashtag', {
    templateUrl: '/static/js/explorehashtag/explorehashtag.html',
    controller: 'ExploreController as exploreCtr'
  });
}]);

