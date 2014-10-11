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
  'tripStoryApp.hashtag',
  'tripStoryApp.profile',
  'tripStoryApp.share'
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

     $rootScope.loggedIn = false;

      $scope.isActive = function(route) {
        return route === $location.path();
      };



      $scope.noLoginNecessary = function(path) {

        return path.indexOf('/share') === 0 ||
            path.indexOf('/register') === 0 ||
            path.indexOf('/login') === 0;
      };

      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        if (newUrl === oldUrl) {
          return;
        }

        var path = $location.path();
        if (!$rootScope.loggedIn && !$scope.noLoginNecessary(path)) {
            $location.path('login');
        }

      });

      this.showNavbar = function() {

         return $rootScope.loggedIn ||
            $location.path().indexOf('/share') === 0;
      };

      if (!$scope.noLoginNecessary($location.path())) {
          // check with service
          Backend.userService().loggedIn(function(user) {
            $rootScope.loggedIn = true;
            $rootScope.user = user;
          },
          function(error) {

            $location.path('login');
          });
      }

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
