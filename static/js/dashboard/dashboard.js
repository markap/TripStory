'use strict';

angular.module('tripStoryApp.dashboard', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/dashboard', {
    templateUrl: '/static/js/dashboard/dashboard.html',
    controller: 'DashboardController'
  });
}])

.controller('DashboardController', ['$scope', '$location', 'Backend', '$rootScope',
        function($scope, $location, Backend, $rootScope) {


    Backend.dashboardService().get(function(data) {
       console.log(data);
       $scope.user = data.user;
       $scope.servers = data.servers;
    },
    function(err) {
       console.log(err);
    });

}]);