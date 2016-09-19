angular.module('list', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/festivals', {
      templateUrl : 'pages/list/search.html',
      controller : 'FestivalListCtrl'
    });
})

.controller('FestivalListCtrl', function($scope, festivalEntry, AlertService, $timeout){

  if (AlertService.hasAlert()) {
    $scope.alertMessage = AlertService.getSuccess();
    $timeout(function () {$scope.alertMessage = "";}, 3000);
    AlertService.reset();
  }

  $scope.festivals = festivalEntry.query();
  $scope.currentPage = 1; // keeps track of the current page
  $scope.pageSize = 5; // holds the number of items per page

  $scope.sort = function(keyname){
    $scope.sortKey = keyname;   //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  }

  $scope.nextPage = function() {
    console.log("nextPage");
    $scope.currentPage = $scope.currentPage + 1;
    $scope.$apply();
  };


  $scope.redirect = function(festival) {
    var location = "/#/festival/" + festival._id;
    window.location = location;
  };

});
