angular.module('emails', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/emails', {
      templateUrl : 'pages/email-list/email-list.html',
      controller : 'EmailListCtrl'
    });
})

.controller('EmailListCtrl', function($scope, emailsEntry, AlertService, $timeout){

  if (AlertService.hasAlert()) {
    $scope.alertMessage = AlertService.getSuccess();
    $timeout(function () {$scope.alertMessage = "";}, 3000);
    AlertService.reset();
  }

  $scope.emails = emailsEntry.query();
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


  $scope.redirect = function(email) {
    var location = "/#/email/" + email._id;
    window.location = location;
  };

  $scope.newEmail = function() {
    window.location = "/#/email"
  }

});
