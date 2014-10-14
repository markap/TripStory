'use strict';

angular.module('tripStoryApp.story', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/story/:tripId', {
    templateUrl: '/static/js/story/story.html',
    controller: 'StoryController as storyCtr'
  });
  $routeProvider.when('/share/:tripId', {
    templateUrl: '/static/js/story/story.html',
    controller: 'StoryController as storyCtr'
  });

}])


.controller('StoryController', ['$scope', '$location', 'Backend', '$rootScope',
        '$sce', '$routeParams', '$timeout',
        function($scope, $location, Backend, $rootScope, $sce, $routeParams, $timeout) {


    $scope.trip = null;
    $scope.displayLocationDeletePopup = false;
    $scope.isMyStory = false;

    if ($location.path().indexOf('/share') === 0) {
        $rootScope.loggedIn = false;
        Backend.dashboardService().getForShare($routeParams.tripId, function(data) {

          $scope.trip = data.trip;
          $scope.trip.position = 0;

          $scope.isMyStory = false;

          $scope.populateMap(data);
        },
        function(err) {
          console.log(err);
        });
    } else {
        Backend.dashboardService().getDetails($routeParams.tripId, function(data) {

          $scope.trip = data.trip;
          $scope.trip.position = 0;

          $scope.isMyStory = $rootScope.loggedIn && data.trip.user.id === $rootScope.user.id;

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

    this.showThumb = function(images, imageId) {
      if (!(imageId in images)) {
        return;
      }
      return '/api/thumb/' + images[imageId]
    };

    this.showImage = function(images, imageId) {
      if (!(imageId in images)) {
        return;
      }
      return '/api/img/' + images[imageId]
    };

    this.convertToDate = function(date) {
      return new Date(date);
    };

    this.hashTagUrl = function(words) {
      if (!words) {
          return "";
      }

      var wordsArr = words.split(' ');
      var outArr = [];

      $.each(wordsArr,function(i,val){
        if(val.indexOf('#') === 0) {
          val = "<a href='#hashtag/" + val.replace(/#/g, '') + "'>" + val + "</a>";

        }
        outArr.push(val);
      });

      return outArr.join(' ');
    };

    this.getDescription = function() {
      if (!$scope.trip) {
          return "";
      }
      var locationIndex = $scope.trip['position'];
      var desc = $scope.trip['locations'][locationIndex]['description'];
      return this.hashTagUrl(desc);
    };

    var markers = [];
    var activeMarkerIcon = "/static/assets/star-active.png";
    var inactiveMarkerIcon = "/static/assets/star-inactive.png";

    $scope.populateMap = function() {

      var locations = $scope.trip['locations'];

      var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(locations[0]['lat'], locations[0]['lng']),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };


      var map = new google.maps.Map(document.getElementById('map'), mapOptions);





      var bounds = new google.maps.LatLngBounds();


      var previousMarker = null;


      for (var j = 0; j < locations.length; j++) {
        var icon = (j === 0) ? activeMarkerIcon : inactiveMarkerIcon;


        var currentMarker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[j].lat, locations[j].lng),
            map: map,
            icon: icon,
            title: locations[j]['description'],
            id: j
        });
        bounds.extend(currentMarker.position);
        markers.push(currentMarker);


        google.maps.event.addListener(currentMarker, 'click', (function(m) {
            return function() {

                for (var i = 0; i < markers.length; i++) {
                  markers[i].setIcon(inactiveMarkerIcon);
                }
                m.setIcon(activeMarkerIcon);

                $scope.trip['position'] = m.id;
                $scope.$apply();
            };
        })(currentMarker));

        if (previousMarker) {
            $timeout((function(previous, current){
              return function() {
                $scope.calculateRoute(previous.position, current.position, map);
              };
            }(previousMarker, currentMarker)), j > 10 ? 400*j : 0);
        }
        previousMarker = currentMarker;
      }
      map.fitBounds(bounds);
    };


    this.isMyStory = function() {
      return $scope.isMyStory;
    };

    this.showStory = function($index) {
      return $scope.trip.position === $index;
    };

    this.showDeleteLocationPopup = function(show) {
      $scope.displayLocationDeletePopup = show;
    };

    this.displayDeleteLocationPopup = function() {
        return $scope.displayLocationDeletePopup === true;
    }

    this.deleteLocation = function(tripId) {

      Backend.mapService().delete(tripId, function(data) {
        $location.path('profile');
      }, function(err) {
        console.log(err);
      });

    };

    this.updateName = function(name) {
      Backend.mapService().updateName($scope.trip.id, name, function(data) {
      }, function(err){
        console.log(err);
      });

    };


    this.updateDescription = function(description, $index) {
      Backend.mapService().updateDescription($scope.trip.id, $index, description, function(data) {
      }, function(err){
        console.log(err);
      });
    };


    this.navbarIndex = function($index) {
      return $index + 1;
    };

    this.navbarClick = function($index) {

        for (var i = 0; i < markers.length; i++) {
            markers[i].setIcon(inactiveMarkerIcon);
        }
        markers[$index].setIcon(activeMarkerIcon);

        $scope.trip['position'] = $index;
    };

    this.navbarActive = function($index) {

      return $index === $scope.trip.position;
    };


    this.showProfile = function(user) {
      if (this.isMyStory(user)) {
        $location.path('profile');
      } else {
        $location.path('profile/' + user.id);
      }
    };


    this.hasLike = function(expectsLike) {
      if (!$rootScope.loggedIn || !$scope.trip) {
          return false;
      }


      if ($rootScope.user.id in $scope.trip['likes']) {
          return expectsLike;
      }
      return !expectsLike;
    };


    this.giveLike = function(tripId) {
      Backend.mapService().giveLike(tripId, function(data) {
        $scope.trip['likes'] = data['likes'];
      }, function(err) {
        console.log(err);
      });
    };

    this.showLikes = function() {
      if (!$scope.trip) {
          return "";
      }

      var html = [];
      var likes = $scope.trip['likes'];

      for (var likeId in likes) {
        html.push('<a href="#profile/' + likeId + '">' + likes[likeId] + '</a>');
      }
      return html.join(", ");
    };

}]);