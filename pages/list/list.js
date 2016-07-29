angular.module('list', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/list', {
      templateUrl : 'pages/list/search.html',
      controller : 'PizzaCtrl'
    });
})

.controller('PizzaCtrl', function($scope){
  $scope.articles = [
      {id:1, name: "Pizza Americana", price: 100},
      {id:2, name: "Pizza Tonno", price: 50},
      {id:3, name: "Pizza Arschloch", price:150}
  ];
});
