'use strict';

angular.module('tripStoryApp.share', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/share/:shareId', {
    templateUrl: '/static/js/share/share.html',
    controller: 'DashboardController as dashboardCtr'
  });
}])
;