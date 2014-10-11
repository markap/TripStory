'use strict';

angular.module('tripStoryApp.details', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/details/:tripId', {
    templateUrl: '/static/js/details/details.html',
    controller: 'DashboardController as dashboardCtr'
  });
}]);
