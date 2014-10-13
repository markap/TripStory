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

      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/hashtag') === 0) {
      $scope.hashtag = $routeParams.hashtag;

      Backend.dashboardService().getForHashtag($scope.hashtag, function(data) {
        $scope.trips = data.trips;

      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/profile') === 0) {

      var userId = $routeParams.userId ? $routeParams.userId : null;

      Backend.dashboardService().getForUser(userId, function(data) {
        $scope.trips = data.trips;
        $scope.profile = data.user;

      },
      function(err) {
        console.log(err);
      });

    } else if ($location.path().indexOf('/share') === 0) {

      $rootScope.loggedIn = false;
      Backend.dashboardService().getForShare($routeParams.shareId, function(data) {
        $scope.trips = data.trips;

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

    this.showStaticMap = function(locations) {
        var url = "http://maps.googleapis.com/maps/api/staticmap?center=" +
                locations[0].lat + "," +
                locations[1].lng + "&zoom=4&size=300x300&maptype=roadmap&sensor=false";

        for (var i = 0; i< locations.length; i++) {
            url += "&markers=icon:http://travelstoryme.appspot.com/static/assets/star-active.png%7C" + locations[i].lat + "," + locations[i].lng;
        }

        return url;

    };


}]);