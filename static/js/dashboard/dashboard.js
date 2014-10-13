'use strict';

angular.module('tripStoryApp.dashboard', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/dashboard', {
    templateUrl: '/static/js/dashboard/dashboard.html',
    controller: 'DashboardController as dashboardCtr'
  });
}])


.controller('DashboardController', ['$scope', '$location', 'Backend', '$rootScope',
        '$sce', '$routeParams', '$timeout',
        function($scope, $location, Backend, $rootScope, $sce, $routeParams, $timeout) {

    $scope.trips = [];

    console.log('template url');
    console.log($location);
    if ($location.path() === '/dashboard') {
      Backend.dashboardService().get(function(data) {
        $scope.trips = data.trips;

        $scope.populateMap(data);
      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/hashtag') === 0) {
      $scope.hashtag = $routeParams.hashtag;

      Backend.dashboardService().getForHashtag($scope.hashtag, function(data) {
        $scope.trips = data.trips;
        $scope.populateMap(data);
      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/profile') === 0) {

      var userId = $routeParams.userId ? $routeParams.userId : null;

      Backend.dashboardService().getForUser(userId, function(data) {
        $scope.trips = data.trips;
        $scope.profile = data.user;

        $scope.populateMap(data);
      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/share') === 0) {

      $rootScope.loggedIn = false;
      Backend.dashboardService().getForShare($routeParams.shareId, function(data) {
        $scope.trips = data.trips;

        $scope.populateMap(data);
      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/details') === 0) {


      Backend.dashboardService().getDetails($routeParams.tripId, function(data) {
        $scope.trips = data.trips;

        $scope.populateMap(data);
      },
      function(err) {
        console.log(err);
      });
    }



    var directionsService = new google.maps.DirectionsService();



    $scope.calculateRoute = function(origin, destination, map) {
      // Create a renderer for directions and bind it to the map.
      var rendererOptions = {
        map: map,
        preserveViewport: true,
        suppressMarkers: true
      };

      var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      };


      directionsService.route(request, function(response, status) {
        console.log("status is " + status);
        if (status == google.maps.DirectionsStatus.OK) {
          var renderer = new google.maps.DirectionsRenderer(rendererOptions);
          renderer.setDirections(response);
        }
      });

    };



    this.hasImage = function(mapId, imageId) {

      return mapId in $scope.trips &&
                'position' in $scope.trips[mapId] &&
                imageId in $scope.trips[mapId]['locations'][$scope.trips[mapId]['position']]['images']
    };

    this.showImage = function(mapId, imageId) {
      if (!this.hasImage(mapId, imageId)) {
        return;
      }
      return '/api/img/' + $scope.trips[mapId]['locations'][$scope.trips[mapId]['position']]['images'][imageId]
    };

    this.convertToDate = function(date) {
      return new Date(date);
    };

    this.hashTagUrl = function(words) {

      var wordsArr = words.split(' ');
      var outArr = [];

      $.each(wordsArr,function(i,val){
        if(val.indexOf('#') === 0) {
          val = "<a href='#hashtag/" + val.replace(/#/g, '') + "'>" + val + "</a>";

        }
        outArr.push(val);
      });

      return $sce.trustAsHtml(outArr.join(' '));
    };

    this.getDescription = function(index) {
    console.log('index');
      console.log(index);
      var locationIndex = 'position' in $scope.trips[index]
                            ? $scope.trips[index]['position'] : 0;
      var desc = $scope.trips[index]['locations'][locationIndex]['description'];
      return this.hashTagUrl(desc);
    };


    $scope.populateMap = function(data) {
        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng(40.0000, -98.0000),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        var maps = [];
        var markers = [];
        var markerData = [];
        var routesCount = 0;

        setTimeout(function(){

            for (var i = 0; i < data.trips.length; i++) {
              maps[i] = new google.maps.Map(document.getElementById('map' + i), mapOptions);
              markers[i] = [];

              // default values: show marker 0
              console.log(data.trips);
              var locations = data.trips[i].locations;
              console.log('loc');
              console.log(locations);
              markerData[i] = {'locations': locations};
              $scope['description' + i] = locations[0].description;
              $scope.trips[i]['position'] = 0;
              $scope.$apply();

              var previousMarker = null;
              var bounds = new google.maps.LatLngBounds();
              var activeMarkerIcon = "/static/assets/star-active.png";
              var inactiveMarkerIcon = "/static/assets/star-inactive.png";


              for (var j = 0; j < locations.length; j++) {
                      var icon = (j === 0) ? activeMarkerIcon : inactiveMarkerIcon;


                      var currentMarker = new google.maps.Marker({
                            position: new google.maps.LatLng(locations[j].lat, locations[j].lng),
                            map: maps[i],
                            icon: icon,
                            title: locations[j]['description'],
                            id: {
                              'map': i,
                              'location': j
                            }
                        });
                        bounds.extend(currentMarker.position);
                        markers[i].push(currentMarker);


                        if (previousMarker) {
                            console.log("route count is " + routesCount);
                            routesCount++;
                            $timeout((function(previous, current, map){
                                return function() {
                                    $scope.calculateRoute(previous.position, current.position, map);
                                };
                            }(previousMarker, currentMarker, maps[i]))
                            , routesCount > 10 ? 400*routesCount : 0);
                        }

                        google.maps.event.addListener(currentMarker, 'click', (function(m) {
                            return function() {

                                var mapId = m.id['map'];
                                var locationId = m.id['location'];
                                console.log("ids");
                                console.log(mapId);
                                console.log(locationId);
                                console.log(markerData[mapId]);

                                console.log(markers);
                                for (var i = 0; i < markers[mapId].length; i++) {
                                  markers[mapId][i].setIcon(inactiveMarkerIcon);
                                }
                                m.setIcon(activeMarkerIcon);

                                $scope['description' + mapId] = markerData[mapId]['locations'][locationId]['description'];
                                $scope.trips[mapId]['position'] = locationId;
                                $scope.$apply();
                            };
                        })(currentMarker));

                        previousMarker = currentMarker;

              }
              maps[i].fitBounds(bounds);

            }

        }, 50);

    };


    $scope.displayLocationDeletePopup = [];

    this.isMyStory = function(user) {
      return $rootScope.loggedIn && user.id === $rootScope.user.id;
    };

    this.showDeleteLocationPopup = function(show, alertId) {
      $scope.displayLocationDeletePopup[alertId] = show;
    };

    this.displayDeleteLocationPopup = function(alertId) {
        console.log(alertId in $scope.displayLocationDeletePopup &&
                $scope.displayLocationDeletePopup[alertId] === true);
        return alertId in $scope.displayLocationDeletePopup &&
                $scope.displayLocationDeletePopup[alertId] === true;
    }

    this.deleteLocation = function(alertId, tripId) {

      Backend.mapService().delete(tripId, function(data) {
        $scope.displayLocationDeletePopup[alertId] = false;
        //trips.splice(alertId, 1);
        $('#trip'+alertId).hide();
      }, function(err) {
        console.log(err);
      });

    };


    this.showProfile = function(user) {
      if (this.isMyStory(user)) {
        $location.path('profile');
      } else {
        $location.path('profile/' + user.id);
      }
    };


    this.hasLike = function(expectsLike, index) {
      if ($rootScope.user.id in $scope.trips[index]['likes']) {
          return expectsLike;
      }
      return !expectsLike;
    };


    this.giveLike = function(tripId, index) {
      Backend.mapService().giveLike(tripId, function(data) {
        $scope.trips[index]['likes'] = data['likes'];
      }, function(err) {
        console.log(err);
      });
    };

    this.showLikes = function(index) {

      if (!(index in $scope.trips)) {
        return '';
      }

      var html = [];
      var likes = $scope.trips[index]['likes'];

      for (var likeId in likes) {
        html.push('<a href="#profile/' + likeId + '">' + likes[likeId] + '</a>');
      }
      return html.join(", ");
    };


    this.showProfileCreateStory = function() {
      return $location.path() === '/profile' && $scope.trips.length === 0;
    };


    this.showMap = function(path) {
      var userId = $routeParams.userId ? $routeParams.userId : "";
      $location.path(path + '/' + userId);
    };

    this.showHashtagMap = function(path) {
      $location.path(path + '/' + $scope.hashtag);
    };


}]);