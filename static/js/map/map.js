'use strict';

angular.module('tripStoryApp.map', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/map', {
    templateUrl: '/static/js/map/map.html',
    controller: 'MapController as mapCtr'
  });
}])

.controller('MapController', ['$scope', '$location', 'Backend', '$rootScope',
        '$timeout', 'FileUploader',
        function($scope, $location, Backend, $rootScope, $timeout, FileUploader) {


    var maxZIndex = google.maps.Marker.MAX_ZINDEX;
    $scope.currentZIndex = maxZIndex;


    var uploader = $scope.uploader = new FileUploader({
        url: '/api/map/upload',
        autoUpload: true
    });

    uploader.filters.push({
    name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });


    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        if ($scope.trip.locations[$scope.trip.currentPosition].images.length > 2) {
            uploader.cancelItem(item);
        }
        item.formData = {'position':$scope.trip.currentPosition};
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $scope.trip.locations[fileItem.formData.position].images.push(response.key);
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    $scope.trip = {
      name: '',
      currentPosition: -1,
      description: '',
      currentMarker: null,
      locations: []
    };

    /**
    $(window).bind('beforeunload', function(){
        return 'false';
    });
    */


    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    var directionsService = new google.maps.DirectionsService();
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Create the search box and link it to the UI element.
    var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));


    $scope.showSearchBoxResult = function() {
        var places = searchBox.getPlaces();
        console.log(places);

        $scope.trip.currentPosition = -1;
        $scope.setMarkersInactive();

        if (places.length == 0) {
          return;
        }

        if ($scope.trip.currentMarker) {
            $scope.trip.currentMarker.setMap(null);
        }

        var bounds = new google.maps.LatLngBounds();

        // Create a marker for the place.
        $scope.trip.currentMarker = new google.maps.Marker({
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

    };


    $('#pac-input').bind("enterKey",function(e){
        $scope.showSearchBoxResult();
        return false;
    });
    $('#pac-input').keyup(function(e){
        if(e.keyCode == 13) {
            $(this).trigger("enterKey");
            return false;
        }

    });

    $(window).keydown(function(event){
      if(event.keyCode == 13) {
        event.preventDefault();
          return false;
      }
    });

/**
    $scope.$on('$locationChangeStart', function(event) {

var r = confirm("You will lose all your progress\n\n Are you sure you want to leave this page?");
window.onbeforeunload = null;
if (r == true) {

} else {
    event.preventDefault();
}
    });

    $(window).on('beforeunload', function(){
      return 'You will lose all your progress';
    });

    $(window).on('unload', function() {
      window.onbeforeunload = null;
      //window.onbeforeunload = undefined;
    });
    */



    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        $scope.showSearchBoxResult();
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

    this.calculateRoute = function(origin, destination, position, travelMode) {

      travelMode = typeof travelMode !== 'undefined' ? travelMode : google.maps.TravelMode.DRIVING;

      var request = {
        origin: origin,
        destination: destination,
        travelMode: travelMode
      };

      console.log(request);

      var me = this;

      directionsService.route(request, function(response, status) {
          console.log('dir service');
          console.log(response);
          console.log(status);
        if (status == google.maps.DirectionsStatus.OK) {
          var renderer = new google.maps.DirectionsRenderer(rendererOptions);
          renderer.setDirections(response);
          $scope.trip.locations[position]['renderer'] = renderer;
        }


      });

    };



    $scope.setMarkersInactive = function() {
       var locations = $scope.trip.locations;
       for (var i = 0; i < locations.length; i++) {
          locations[i].marker.setIcon(inactiveMarkerIcon);
      }
    };



    google.maps.event.addListener(map, 'click', function(e) {

      $scope.trip.currentPosition = -1;
      $scope.trip.description = '';


      $scope.setMarkersInactive();


      if ($scope.trip.currentMarker) {
          $scope.trip.currentMarker.setMap(null);
      }

      $scope.trip.currentMarker = new google.maps.Marker({
        position: e.latLng,
        map: map
      });
      $scope.$apply();
    });

    var activeMarkerIcon = "/static/assets/star-active.png";
    var inactiveMarkerIcon = "/static/assets/star-inactive.png";


    this.saveLocation = function(trip) {


      if ($scope.trip.currentMarker) {
        $scope.trip.currentMarker.setMap(null);


        var fixedMarker = new google.maps.Marker({
          position: $scope.trip.currentMarker.position,
          map: map,
          icon: activeMarkerIcon,
          zIndex: $scope.currentZIndex++
        });
        $scope.trip.currentMarker = null;

        // calculate route btw new and previous marker
        var locations = $scope.trip.locations;
        if (locations.length > 0) {
            var previousPosition = locations[locations.length-1]['marker'].position;
            var currentPosition = fixedMarker.position;

            this.calculateRoute(previousPosition, currentPosition, locations.length-1);
        }


        locations.push({
          'marker': fixedMarker,
          'description': trip.description,
          'images': []
        });

        console.log("save");
        console.log(locations);


        $scope.trip.currentPosition = locations.length-1;

        google.maps.event.addListener(fixedMarker, 'click', (function(m) {
          return function() {

            var locations = $scope.trip.locations;
            console.log(locations);

            var newPosition = -1;

            for (var i = 0; i < locations.length; i++) {

              if (locations[i]['marker'] === m) {
                  newPosition = i;
                  break;
              }
            }

            if ($scope.trip.currentMarker) {
                $scope.trip.currentMarker.setMap(null);
                $scope.trip.currentMarker = null;
            };

            $scope.setMarkersInactive();
            m.setIcon(activeMarkerIcon);
            m.setZIndex($scope.currentZIndex++);

            $scope.trip.currentPosition = newPosition;
            $scope.trip.description = locations[newPosition].description;
            $scope.$apply();
          };
        })(fixedMarker));
      }

    };

    this.deleteLocation = function() {

      var locations = $scope.trip.locations;
      var location = locations[$scope.trip.currentPosition];
      // delete the marker first
      location['marker'].setMap(null);

      // if there are routes, delete the routes
      if (location.hasOwnProperty('renderer')) {
        location['renderer'].setMap(null);
      }
      if ($scope.trip.currentPosition-1 >= 0 &&
          locations[$scope.trip.currentPosition-1].hasOwnProperty('renderer')) {
        locations[$scope.trip.currentPosition-1]['renderer'].setMap(null);
      }

      locations.splice($scope.trip.currentPosition, 1);

      if (locations.length > 0) {
        var previousPosition = $scope.trip.currentPosition;
        $scope.trip.currentPosition = previousPosition > 0 ? previousPosition -1 : previousPosition;
        $scope.trip.description = locations[$scope.trip.currentPosition]['description'];
        locations[$scope.trip.currentPosition].marker.setIcon(activeMarkerIcon);
        locations[$scope.trip.currentPosition].marker.setZIndex($scope.currentZIndex++);

        // recalulate route
        if (locations.length > 1 && $scope.trip.currentPosition < locations.length-1) {
          this.calculateRoute(locations[$scope.trip.currentPosition]['marker'].position,
            locations[$scope.trip.currentPosition+1]['marker'].position, $scope.trip.currentPosition);
        }
      }

    };


    this.navbarIndex = function($index) {
      return $index + 1;
    };

    this.navbarClick = function($index) {
        var location = $scope.trip.locations[$index];

        if ($scope.trip.currentMarker) {
            $scope.trip.currentMarker.setMap(null);
            $scope.trip.currentMarker = null;
        };

        $scope.setMarkersInactive();
        location['marker'].setIcon(activeMarkerIcon);
        location['marker'].setZIndex($scope.currentZIndex++);

        $scope.trip.currentPosition = $index;
        $scope.trip.description = location.description;
    };

    this.navbarActive = function($index) {
      return $index === $scope.trip.currentPosition;
    };

    this.nextLocation = function() {
      $scope.trip.currentPosition = -1;

      $scope.setMarkersInactive();
    };

    this.showDeleteButton = function() {
      return $scope.trip.currentPosition in $scope.trip.locations;
    };

    this.showDropZone = function(imageId) {
      return !this.hasImage(imageId) && this.showDeleteButton();
    };

    this.disableFileUpload = function() {
      var locations = $scope.trip.locations;
      var currentPosition = $scope.trip.currentPosition;
      return !(currentPosition in locations && locations[currentPosition].images.length < 3);
    };


    this.showHint = function() {
      return $scope.trip.currentPosition === -1 && $scope.trip.currentMarker === null;
    }

    this.showSaveButton = function() {
      return $scope.trip.currentMarker !== null;
    };

    this.deleteImage = function(position) {
      $scope.trip.locations[$scope.trip.currentPosition].images.splice(position, 1);
    };

    this.hasImage = function(index) {
        var locations = $scope.trip.locations;
        return $scope.trip.currentPosition in locations && index in locations[$scope.trip.currentPosition].images;
    };

    this.showImage = function(index) {

      if (!this.hasImage(index)) {
          return;
      }
      var location = $scope.trip.locations[$scope.trip.currentPosition];
      //console.log("/api/thumb/" + data[$scope.currentPosition].images[index]);
      return "/api/img/" + location.images[index];
    };

    this.updateDescription = function(description) {
      $scope.trip.locations[$scope.trip.currentPosition].description = description;
    };


    this.showSaveTripButton = function() {
      return $scope.trip.locations.length > 1;
    };

    this.saveTrip = function(name) {
      if ($scope.trip.locations.length < 2) {
          return;
      }

      var trip = {
        'name': name,
        'locations': []
      };

      var locations = $scope.trip.locations;

      for (var i = 0; i < locations.length; i++) {
        var location = {
          'description': locations[i].description,
          'lat': locations[i]['marker'].position.lat(),
          'lng': locations[i]['marker'].position.lng(),
          'images': locations[i]['images']
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