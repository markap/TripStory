'use strict';



angular.module('tripStoryApp.register', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/register', {
    templateUrl: '/static/js/register/register.html',
    controller: 'RegisterController'
  });
}])

.controller('RegisterController', ['$scope', '$location', 'Backend', '$rootScope',
        function($scope, $location, Backend, $rootScope) {



    this.signIn = function(user) {
      Backend.userService().save(user, function(data) {

        $rootScope.registered = data.username;
        $location.path('login');
      },
      function(err) {
        $scope.errors = err;
      });
    };
}]);
