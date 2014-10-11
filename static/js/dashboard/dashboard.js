'use strict';

angular.module('tripStoryApp.dashboard', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/dashboard', {
    templateUrl: '/static/js/dashboard/dashboard.html',
    controller: 'DashboardController'
  });
}])


.controller('DashboardController', ['$scope', '$location', 'Backend', '$rootScope', '$sce',
        function($scope, $location, Backend, $rootScope, $sce) {

    $scope.trips = [];


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
        if (status == google.maps.DirectionsStatus.OK) {
          var renderer = new google.maps.DirectionsRenderer(rendererOptions);
          renderer.setDirections(response);
        }
      });

    };


    Backend.dashboardService().get(function(data) {
        $scope.trips = data.trips;

        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng(40.0000, -98.0000),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        var maps = [];

        setTimeout(function(){
            for (var i = 0; i < data.trips.length; i++) {
              maps[i] = new google.maps.Map(document.getElementById('map' + i), mapOptions);

              // default values: show marker 0
              var locations = data.trips[i].locations;
              $scope['description' + i] = locations[0].description;
              $scope.trips[i]['position'] = 0;
              $scope.$apply();

              var previousMarker = null;
              var bounds = new google.maps.LatLngBounds();

              for (var j = 0; j < locations.length; j++) {
                      var currentMarker = new google.maps.Marker({
                            position: new google.maps.LatLng(locations[j].lat, locations[j].lng),
                            map: maps[i],
                            title: 'Hello World!',
                            id: {
                              'map': i,
                              'location': j
                            }
                        });
                        bounds.extend(currentMarker.position);

                        if (previousMarker) {
                            $scope.calculateRoute(previousMarker.position, currentMarker.position, maps[i]);
                        }

                        google.maps.event.addListener(currentMarker, 'click', (function(m) {
                            return function() {

                                var mapId = m.id['map'];
                                var locationId = m.id['location'];
                                console.log(data.trips[mapId]);
                                $scope['description' + mapId] = data.trips[mapId]['locations'][locationId]['description'];
                                $scope.trips[mapId]['position'] = locationId;
                                $scope.$apply();
                            };
                        })(currentMarker));

                        previousMarker = currentMarker;

              }
              maps[i].fitBounds(bounds);
            }

        }, 50);




    },
    function(err) {
      console.log(err);
    });

    this.hasImage = function(mapId, imageId) {
      console.log('hasImage ' + mapId + ' ' + imageId);
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


    $scope.displayLocationDeletePopup = [];

    this.isMyStory = function(user) {;
      return user.id === $rootScope.user.id;
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

    this.deleteLocation = function(trips, alertId, tripId) {

      Backend.mapService().delete(tripId, function(data) {
        $scope.displayLocationDeletePopup.splice(alertId, 1);
        trips.splice(alertId, 1);
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
}]);