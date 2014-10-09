'use strict';

angular.module('tripStoryApp.login', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/login', {
    templateUrl: '/static/js/login/login.html',
    controller: 'LoginController'
  });
}])

.controller('LoginController', ['$scope', '$location', 'Backend', '$rootScope',
        function($scope, $location, Backend, $rootScope) {


    if ($rootScope.registered) {
      $scope.registered = $rootScope.registered;
    }
    delete $rootScope.registered;


    this.signUp = function(user) {
      Backend.userService().login(user, function(data) {
        $rootScope.loggedIn = true;
        console.log("result");
        console.log(data);
        $rootScope.user = data;

        $location.path('dashboard');
      }, function(err) {
        $scope.errors = err;
      });
    };

}]);