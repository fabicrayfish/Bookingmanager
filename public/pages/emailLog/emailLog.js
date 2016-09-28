angular.module('emaillog', ['ngRoute', 'ngTouch', 'ngAnimate', 'ui.bootstrap'])

.config(function($routeProvider) {
  $routeProvider
    .when('/emaillog/:id', {
      templateUrl : 'pages/emailLog/emailLog.html',
      controller : 'EmailLogCtrl'
    });
})

.controller('EmailLogCtrl', function($scope, emailsLogEntry, $routeParams){
  var id = $routeParams.id;
  var emailQuery = emailsLogEntry.get({ id: id });
  emailQuery.$promise.then(function(log){
    $scope.emailLog = log;
    $scope.body = $scope.emailLog.body.replace("\n", "</br>");
  });

});
