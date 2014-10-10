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

}]);