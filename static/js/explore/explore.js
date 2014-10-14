'use strict';

angular.module('tripStoryApp.explore', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/explore', {
    templateUrl: '/static/js/explore/explore.html',
    controller: 'ExploreController as exploreCtr'
  });
}])


.controller('ExploreController', ['$scope', '$location', 'Backend', '$rootScope',
        '$sce', '$routeParams',
        function($scope, $location, Backend, $rootScope, $sce, $routeParams) {

    $scope.trips = [];

    if ($location.path() === '/explore') {

        Backend.dashboardService().get(function(data) {
          $scope.populateMap(data);
        },
        function(err) {
          console.log(err);
        });

    } else if ($location.path().indexOf('/exploreprofile') === 0) {

        var userId = $routeParams.userId ? $routeParams.userId : null;

        Backend.dashboardService().getForUser(userId, function(data) {
          $scope.profile = data.user;
          $scope.populateMap(data);
        },
        function(err) {
          console.log(err);
        });

    } else if ($location.path().indexOf('/explorehashtag') === 0) {

        $scope.hashtag = $routeParams.hashtag;

        Backend.dashboardService().getForHashtag($scope.hashtag, function(data) {
          $scope.populateMap(data);
        },
        function(err) {
          console.log(err);
        });
    }



    $scope.populateMap = function(data) {
      $scope.trips = data.trips;

      var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(-80, 40),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };




      var map = new google.maps.Map(document.getElementById('map'), mapOptions);

      var activeMarkerIcon = "/static/assets/star-active.png";
      var bounds = new google.maps.LatLngBounds();
      var infoWindow = new google.maps.InfoWindow();

      for (var j = 0; j < data.trips.length; j++) {
          var locations = data.trips[j]['locations'][0];

          var content = "<div id='container'><blockquote>" + data.trips[j]['name']
                        + "<br /><a style='margin-top: 5px;' href='#story/" + data.trips[j]['id']
                        + "' class='btn btn-custom'>Show me the story</button></blockquote></div>";




          var currentMarker = new google.maps.Marker({
                position: new google.maps.LatLng(locations.lat, locations.lng),
                map: map,
                icon: activeMarkerIcon

          });
          bounds.extend(currentMarker.position);



          google.maps.event.addListener(currentMarker, 'click', (function(aMarker, aContent) {
            return function() {
              infoWindow.close();
              infoWindow.setContent(aContent);
              infoWindow.open(map,aMarker);
            };
          }(currentMarker, content)));

          google.maps.event.addListener(map, 'click', function() {

            for (var i = 0; i < infoWindows.length; i++) {
                infoWindows[i].close();
            }
          });
      }

      if (data.trips.length > 0) {
        map.fitBounds(bounds);
      }
    };


    this.showList = function(path) {
      var userId = $routeParams.userId ? $routeParams.userId : "";
      $location.path(path + '/' + userId);
    };

    this.showHashtagList = function(path) {
      $location.path(path + '/' + $scope.hashtag);
    };
}]);