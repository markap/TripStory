'use strict';

angular.module('tripStoryApp.profile', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/profile/:userId', {
    templateUrl: '/static/js/profile/profile.html',
    controller: 'DashboardController as dashboardCtr'
  });
  $routeProvider.when('/profile', {
    templateUrl: '/static/js/profile/profile.html',
    controller: 'DashboardController as dashboardCtr'
  });
}]);

