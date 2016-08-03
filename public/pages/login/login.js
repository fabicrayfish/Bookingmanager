angular.module('login', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/login', {
      templateUrl : 'pages/login/login.html',
      controller : 'LoginController'
    });
})

.controller('LoginController', function($scope, login, $localStorage, $location){

          $scope.login = new login;

          $scope.submit = function() {
              $scope.login.$save(function(res){
                if (res.success == true) {
                  $localStorage.token = res.token;
                  window.location = "/#/list";
                } else {
                  console.log(res.message);
                }
              }, function(err){
                console.log(err);
              });
          };


});
