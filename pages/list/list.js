angular.module('list', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/list', {
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

  $scope.redirect = function(festival) {
    var location = "/bookingmanager/#/festival/" + festival._id;
    window.location = location;
  };

});
