var backendServices = angular.module('backendServices', ['ngResource']);

backendServices.factory('Backend', ['$resource',
  function($resource){

    var service = {};


    service.userService = function() {
        return {
            save: function(user, success, failure) {

                return $resource('/api/user/signin').save(user, function(data) {
                    if (data.hasOwnProperty('errors')) {
                        console.log(data.errors);
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },

            login: function(user, success, failure) {

                return $resource('/api/user/signup').save(user, function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },

            loggedIn: function(success, failure) {
                return $resource('/api/user/session').get(function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },

            logOut: function(success, failure) {
                return $resource('/api/user/logout').get(function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },

        };
    };

    service.dashboardService = function() {
        return {
            get: function(success, failure) {
                return $resource('/api/dashboard').get(function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            }
        };
    };

    service.mapService = function() {
      return {
        save: function(trip, success, failure) {
          return $resource('/api/map/save').save(trip, function(data) {
                if (data.hasOwnProperty('errors')) {

                    failure(data.errors);

                } else {

                    success(data);
                }
          });
        }
      };
    };
    return service;
  }]);