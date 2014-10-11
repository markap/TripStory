'use strict';

angular.module('tripStoryApp.hashtag', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/hashtag/:hashtag', {
    templateUrl: '/static/js/hashtag/hashtag.html',
    controller: 'DashboardController as dashboardCtr'
  });
}]);
