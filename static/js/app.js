'use strict';

// Declare app level module which depends on views, and components
var tripStoryApp = angular.module('tripStoryApp', [
  'ngRoute',
  'ngSanitize',
  'backendServices',
  'angularFileUpload',
   'xeditable',
  'tripStoryApp.login',
  'tripStoryApp.register',
  'tripStoryApp.dashboard',
  'tripStoryApp.map',
  'tripStoryApp.hashtag',
  'tripStoryApp.profile',
  'tripStoryApp.explore',
  'tripStoryApp.exploreprofile',
  'tripStoryApp.explorehashtag',
  'tripStoryApp.story',
  'tripStoryApp.landingPage'
]);

tripStoryApp.config(['$routeProvider',
        function($routeProvider) {



    $routeProvider.when('/about', {
        templateUrl: '/static/js/includes/about.html',

    });
    $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

tripStoryApp.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableOptions.theme = 'bs3';
});

tripStoryApp.controller('MainController', ['$rootScope', '$location', 'Backend',
    '$scope', function($rootScope, $location, Backend, $scope) {

     $rootScope.loggedIn = false;

      $scope.isActive = function(route) {
        return route === $location.path();
      };



      $scope.noLoginNecessary = function(path) {

        return path.indexOf('/share') === 0 ||
            path.indexOf('/landingpage') === 0 ||
            path.indexOf('/register') === 0 ||
            path.indexOf('/login') === 0;
      };

      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {

        var path = $location.path();
        console.log(oldUrl);
        console.log(newUrl);
        if (!$rootScope.loggedIn && oldUrl.indexOf('share') !== -1 && newUrl.indexOf('share') === -1) {
            $location.path('register');
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

        delete $rootScope.loggedIn;
        delete $rootScope.user;

        Backend.userService().logOut(function(data) {
          //service

          $location.path('login');
        },
        function(error) {
          alert('Unknown error');
        });

      };
}]);
