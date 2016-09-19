angular.module('email', ['ngRoute', 'ngTouch', 'ngAnimate', 'ui.bootstrap'])

.config(function($routeProvider) {
  $routeProvider
    .when('/email/:id', {
      templateUrl : 'pages/email/email.html',
      controller : 'EmailCtrl'
    })
    .when('/email', {
      templateUrl : 'pages/email/email.html',
      controller : 'EmailCtrl'
    });
})

.controller('EmailCtrl', function($scope, emailsEntry, $timeout, $routeParams, AlertService){
  var setupEmail = function() {
    if ($routeParams.id) {
      var id = $routeParams.id;
      var emailQuery = emailsEntry.get({ id: id })
      emailQuery.$promise.then(function(data){
        $scope.email = new emailsEntry();
        angular.copy(data, $scope.email);
        if($scope.email.date.startDate){
          $scope.email.date.startDate = new Date($scope.email.date.startDate);
        }
        if($scope.email.date.endDate){
          $scope.email.date.endDate = new Date($scope.email.date.endDate);
        }
      });
    } else {
      $scope.email = new emailsEntry;
    }
  }

  $scope.endDateOptions = {
    minDate: new Date()
  }

  $scope.startDateOptions = {
    maxDate: new Date()
  }

  setupEmail();


  $scope.backToList = function() {
      window.location = "/#/emails"
  }

  $scope.delete = function() {
    if ($scope.email._id) {
      $scope.email.$delete(function() {});
      AlertService.setSuccess({msg: $scope.email.subject + ' has been deleted.'})
      window.location = "/#/emails"
    }
  }

  $scope.submit = function() {
    if (!$scope.email._id) {
      $scope.email.$save(function() {});
    } else {
      $scope.email.$update(function(){});
    }
    AlertService.setSuccess({msg: $scope.email.subject + ' has been updated successfully.'})
    window.location = "/#/emails"
  }

  $scope.$watch('email.date.startDate', function(niu) {
    if(niu) {
      $scope.endDateOptions.minDate = niu
    }
  });
  $scope.$watch('email.date.endDate', function(niu) {
    if(niu) {
      $scope.startDateOptions.maxDate = niu
    }
  });


});
