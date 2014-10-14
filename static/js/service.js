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
            },

            getForUser: function(userId, success, failure) {
                var params = {};
                if (userId) {
                  params = {'userid': userId};
                }
                return $resource('/api/profile').save(params, function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },

            getForHashtag: function(hashtag, success, failure) {
                return $resource('/api/search').save({'hashtag': hashtag}, function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },
            getForShare: function(shareId, success, failure) {
                return $resource('/api/share').save({'shareid': shareId}, function(data) {
                    if (data.hasOwnProperty('errors')) {
                        failure(data.errors);

                    } else {
                        console.log(data);
                        success(data);
                    }
                });
            },
            getDetails: function(tripId, success, failure) {
                return $resource('/api/dashboard/details').save({'tripid': tripId}, function(data) {
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
        },
        delete: function(tripId, success, failure) {
          return $resource('/api/map/delete').save({'tripid': tripId}, function(data) {
            if (data.hasOwnProperty('errors')) {

                failure(data.errors);

            } else {

                success(data);
            }
          });
        },
        giveLike: function(tripId, success, failure) {
          return $resource('/api/map/like').save({'tripid': tripId}, function(data) {
            if (data.hasOwnProperty('errors')) {

                failure(data.errors);

            } else {

                success(data);
            }
          });
        },
        updateName: function(tripId, name, success, failure) {
            return $resource('/api/map/update.name').save({
              'tripid': tripId,
              'name': name
            }, function(data) {
              if (data.hasOwnProperty('errors')) {

                failure(data.errors);

              } else {

                success(data);
              }
            });
        },
        updateDescription: function(tripId, position, description, success, failure) {
            return $resource('/api/map/update.description').save({
              'tripid': tripId,
              'position': position,
              'description': description
            }, function(data) {
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