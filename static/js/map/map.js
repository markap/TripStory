'use strict';

angular.module('tripStoryApp.map', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/map', {
    templateUrl: '/static/js/map/map.html',
    controller: 'MapController'
  });
}])

.controller('MapController', ['$scope', '$location', 'Backend', '$rootScope',
        '$timeout',
        function($scope, $location, Backend, $rootScope, $timeout) {

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

    var currentMarker = null;

    // Create the search box and link it to the UI element.
    var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));

    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        console.log(places);

        $scope.currentPosition = -1;
        $scope.trip.description = '';

        $scope.setMarkersInactive();

        if (places.length == 0) {
          return;
        }

        if (currentMarker) {
            currentMarker.setMap(null);
        }

        var bounds = new google.maps.LatLngBounds();

        // Create a marker for each place.
        currentMarker = new google.maps.Marker({
            map: map,
            title: places[0].name,
            position: places[0].geometry.location
        });



        bounds.extend(places[0].geometry.location);
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
          var extendPoint = new google.maps.LatLng(bounds.getNorthEast().lat() + 1,
                                            bounds.getNorthEast().lng() + 1);
          bounds.extend(extendPoint);

          extendPoint = new google.maps.LatLng(bounds.getSouthWest().lat() - 1,
                                            bounds.getSouthWest().lng() - 1);
          bounds.extend(extendPoint);
        }
        map.fitBounds(bounds);

        $scope.$apply();

    });


    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });


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

    $scope.setMarkersInactive = function() {
       for (var i = 0; i < data.length; i++) {
          data[i].marker.setIcon(inactiveMarkerIcon);
      }
    };



    google.maps.event.addListener(map, 'click', function(e) {

      $scope.currentPosition = -1;
      $scope.trip.description = '';

      $scope.setMarkersInactive();


      if (currentMarker) {
          currentMarker.setMap(null);
      }

      currentMarker = new google.maps.Marker({
        position: e.latLng,
        map: map,
        title: ''
      });
      $scope.$apply();
    });

    var activeMarkerIcon = "/static/assets/star-active.png";
    var inactiveMarkerIcon = "/static/assets/star-inactive.png";

    this.saveLocation = function(trip) {

      console.log(trip);


      if (currentMarker) {
        currentMarker.setMap(null);
        console.log(currentMarker.position);

        var fixedMarker = new google.maps.Marker({
          position: currentMarker.position,
          map: map,
          icon: activeMarkerIcon,
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

        google.maps.event.addListener(fixedMarker, 'click', (function(m) {
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

            $scope.setMarkersInactive();
            m.setIcon(activeMarkerIcon);

            $scope.trip.description = poi['description'];
            $scope.currentPosition = position;
            $scope.$apply();
          };
        })(fixedMarker));
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
      if (data.length === 0) {
          return;
      }
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
        $timeout(function() {
          $location.path('dashboard');
        }, 100);


      }, function(err) {
        console.log(err);
      });
    };

}]);