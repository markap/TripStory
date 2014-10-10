'use strict';

angular.module('tripStoryApp.map', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/map', {
    templateUrl: '/static/js/map/map.html',
    controller: 'MapController'
  });
}])

.controller('MapController', ['$scope', '$location', 'Backend', '$rootScope',
        function($scope, $location, Backend, $rootScope) {

    var data = [];
    $scope.currentPosition = -1;
    $scope.trip = {
      name: '',
      description: ''
    };

    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    var directionsService = new google.maps.DirectionsService();
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
      map: map,
      preserveViewport: true,
      suppressMarkers: true
    }

    this.calculateRoute = function(origin, destination, position) {
      console.log('here we go');
      console.log(origin);
      console.log(destination);
      var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      };


      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          var renderer = new google.maps.DirectionsRenderer(rendererOptions);
          renderer.setDirections(response);
          data[position]['renderer'] = renderer;
        }
      });

    };


    var currentMarker = null;

    google.maps.event.addListener(map, 'click', function(e) {

      $scope.currentPosition = -1;
      $scope.trip.description = '';


      if (currentMarker) {
          currentMarker.setMap(null);
      }

      currentMarker = new google.maps.Marker({
        position: e.latLng,
        map: map,
        title: 'Hello World!'
      });
      $scope.$apply();
    });



    this.saveLocation = function(trip) {
      console.log(trip);


      if (currentMarker) {
        currentMarker.setMap(null);
        console.log(currentMarker.position);

        var fixedMarker = new google.maps.Marker({
          position: currentMarker.position,
          map: map,
          id: data.length
        });
        currentMarker = null;

        // calculate route btw new and previous marker
        if (data.length > 0) {
            var previousPosition = data[data.length-1]['marker'].position;
            var currentPosition = fixedMarker.position;

            this.calculateRoute(previousPosition, currentPosition, data.length-1);
        }
        data.push({
          'marker': fixedMarker,
          'description': trip.description,
          'images': []
        });


        $scope.currentPosition = data.length-1;

        google.maps.event.addListener(fixedMarker, 'click', (function(m, me) {
          return function() {
            var poi = null;
            var position = -1;
            console.log(m.id);
            for (var i = 0; i < data.length; i++) {
              console.log(data[i].id);
              if (data[i]['marker'].id === m.id) {
                  poi = data[i];
                  position = i;
                  break;
              }
            }

            if (currentMarker) {
                currentMarker.setMap(null);
                currentMarker = null;
            };

            $scope.trip.description = poi['description'];
            $scope.currentPosition = position;
            $scope.$apply();
          };
        })(fixedMarker, this));
      }

    };

    this.deleteLocation = function() {

      // delete the marker first
      data[$scope.currentPosition]['marker'].setMap(null);

      // if there are routes, delete the routes
      if (data[$scope.currentPosition].hasOwnProperty('renderer')) {
        data[$scope.currentPosition]['renderer'].setMap(null);
      }
      if ($scope.currentPosition-1 >= 0 &&
          data[$scope.currentPosition-1].hasOwnProperty('renderer')) {
        data[$scope.currentPosition-1]['renderer'].setMap(null);
      }

      data.splice($scope.currentPosition, 1);
      if (data.length > 0) {
        var previousPosition = $scope.currentPosition;
        $scope.currentPosition = previousPosition > 0 ? previousPosition -1 : previousPosition;
        $scope.trip.description = data[$scope.currentPosition]['description'];

        // recalulate route
        if (data.length > 1 && $scope.currentPosition < data.length-1) {
          this.calculateRoute(data[$scope.currentPosition]['marker'].position,
            data[$scope.currentPosition+1]['marker'].position, $scope.currentPosition);
        }
      }

    };

    this.showDeleteButton = function() {
      return $scope.currentPosition in data;
    };

    this.showSaveButton = function() {
      return currentMarker !== null;
    };

    this.onImageUploadSuccess = function(response) {
      data[$scope.currentPosition].images.push(response.data.key);
    };

    this.onImageUploadError = function(err) {
      console.log("erro");
      console.log(err);
    };

    this.hasImage = function(index) {
      console.log("has image at index " + index);
      return $scope.currentPosition in data
        && index in data[$scope.currentPosition].images;
    };

    this.showImage = function(index) {
      console.log('show image func for index ' + index);
      console.log(this.hasImage(index));
      if (!this.hasImage(index)) {
          return;
      }
      console.log("/api/img/" + data[$scope.currentPosition].images[index]);
      return "/api/img/" + data[$scope.currentPosition].images[index];
    };

    this.updateDescription = function(trip) {
      data[$scope.currentPosition].description = trip.description;

    };

    this.showSaveTripButton = function() {
      return data.length > 0;
    };

    this.saveTrip = function(name) {
      console.log(name);
      console.log(data);
      var trip = {
        'name': name,
        'locations': []
      };

      for (var i = 0; i < data.length; i++) {
        var location = {
          'description': data[i].description,
          'lat': data[i]['marker'].position.lat(),
          'lng': data[i]['marker'].position.lng(),
          'images': data[i]['images']
        };
        trip.locations.push(location);
      }
      Backend.mapService().save(trip, function(data) {
        $location.path('dashboard');
      }, function(err) {
        console.log(err);
      });
    };

}]);