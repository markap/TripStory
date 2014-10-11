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


    Backend.dashboardService().get(function(data) {
      $scope.trips = data.trips;

      var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };


      var map = new google.maps.Map(document.getElementById('map'), mapOptions);
      var activeMarkerIcon = "/static/assets/star-active.png";
      var bounds = new google.maps.LatLngBounds();

      for (var j = 0; j < data.trips.length; j++) {
          var locations = data.trips[j]['locations'][0];

          var content = "<div id='container'><blockquote>" + data.trips[j]['name']
                        + "<br /><a style='margin-top: 5px;' href='#details/" + data.trips[j]['id']
                        + "' class='btn btn-custom'>Show me the story</button></blockquote></div>";




          var currentMarker = new google.maps.Marker({
                position: new google.maps.LatLng(locations.lat, locations.lng),
                map: map,
                icon: activeMarkerIcon

          });
          bounds.extend(currentMarker.position);


          var infoWindow = new google.maps.InfoWindow({
                content: content
          });

          google.maps.event.addListener(currentMarker, 'click', (function(aInfoWindow, aMarker) {
            return function() {

              aInfoWindow.open(map,aMarker);
            };
          }(infoWindow, currentMarker)));
      }

      map.fitBounds(bounds);
    },
    function(err) {
      console.log(err);
    });


    this.show = function() {
        alert('hallo');
    };


    this.showList = function() {
      $location.path('dashboard');
    };
}]);