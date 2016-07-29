var app = angular.module('BookingManager', ['ngRoute', 'ngResource', 'BookingManager.services', 'festival', 'list',]);

app.config(function($locationProvider, $routeProvider) {

  $routeProvider.otherwise({redirectTo: '/festival'});
});

angular.module('BookingManager.services', []).factory('festivalEntry', function($resource) {
  return $resource('http://localhost:5000/places/:id', { id: '@_id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  });
});
