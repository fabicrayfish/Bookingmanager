angular.module('list', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/festivals', {
      templateUrl : 'pages/list/search.html',
      controller : 'FestivalListCtrl'
    });
})

.controller('FestivalListCtrl', function($scope, $rootScope, festivalEntry, AlertService, $timeout){

  if (AlertService.hasAlert()) {
    $scope.alertMessage = AlertService.getSuccess();
    $timeout(function () {$scope.alertMessage = "";}, 3000);
    AlertService.reset();
  }

  $scope.festivals = festivalEntry.query();
  $scope.currentPage = $rootScope.festivals.currentPage; // keeps track of the current page
  $scope.sortKey = $rootScope.festivals.sortKey;
  $scope.reverse = $rootScope.festivals.reverse;
  $scope.pageSize = 5; // holds the number of items per page

  $scope.sort = function(keyname){
    $rootScope.festivals.sortKey = keyname;   //set the sortKey to the param passed
    $scope.sortKey = keyname;
    $rootScope.festivals.reverse = !$rootScope.festivals.reverse; //if true make it false and vice versa
    $scope.reverse = !$scope.reverse;
  }

  $scope.getSortValue = function(festival){
    var sortKeyEdited = $scope.sortKey;

    if($scope.sortKey) {
      sortKeyEdited = sortKeyEdited.replace("%lastDate%", festival.dates.length - 1);
      return getDescendantProp(festival, sortKeyEdited);
    }

    return undefined;
  }

  function getDescendantProp(obj, desc) {
    var arr = desc.split(".");
    while(arr.length && (obj = obj[arr.shift()]));
    var date = moment(obj)
    if (!date.isValid()) {
      return obj ? obj : '';
    }
    return date.format('MM-DD');
  }

  $scope.onPageChange = function(newPageNumber, oldPageNumber) {
    $rootScope.festivals.currentPage = newPageNumber;
  };


  $scope.redirect = function(festival) {
    var location = "/#/festival/" + festival._id;
    window.location = location;
  };

  $scope.newFestival = function() {
    window.location = "/#/festival"
  }

});
