'use strict';

// Declare app level module which depends on views, and components
var tripStoryApp = angular.module('tripStoryApp', [
  'ngRoute',
  'ngSanitize',
  'backendServices',
  'lr.upload',
  'hashtagify',
  'tripStoryApp.login',
  'tripStoryApp.register',
  'tripStoryApp.dashboard',
  'tripStoryApp.map',
  'tripStoryApp.hashtag'
]);

tripStoryApp.config(['$routeProvider',
        function($routeProvider) {

    $routeProvider.when('/about', {
        templateUrl: '/static/js/includes/about.html',

    });
    $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

tripStoryApp.controller('MainController', ['$rootScope', '$location', 'Backend',
    '$scope', function($rootScope, $location, Backend, $scope) {

      $scope.isActive = function(route) {
        return route === $location.path();
      }

      // check with service
      Backend.userService().loggedIn(function(user) {
        $rootScope.loggedIn = true;
        $rootScope.user = user;
      },
      function(error) {

        $location.path('login');
      });

      this.logout = function() {

        Backend.userService().logOut(function(data) {
          //service
          delete $rootScope.loggedIn;
          delete $rootScope.user;

          $location.path('login');
        },
        function(error) {
          alert('Unknown error');
        });

      };
}]);
