var app = angular.module('BookingManager', ['ngRoute', 'ngResource', 'ngStorage', 'BookingManager.services', 'festival', 'list', 'login']);

app.config(function($locationProvider, $routeProvider, $httpProvider) {
  $httpProvider.interceptors.push('authenticationInterceptor');
  $routeProvider.otherwise({redirectTo: '/festival'});
});

app.factory('authenticationInterceptor', function($q, $location, $localStorage){
  return{
    'request': function (config){
      config.headers = config.headers || {};
      if ($localStorage.token) {
        config.headers['x-access-token'] = $localStorage.token
      }
      return config;
    },
    'responseError': function(response) {
      console.log("responseError");
      if(response.status == 401 || response.status == 403) {
        window.location = "/bookingmanager/#/login";
      }
      return $q.reject(response);
    }
  }
});

app.factory('AlertService', function () {
  var success = {},
      error = {},
      alert = false;
  return {
    getSuccess: function () {
      return success;
    },
    setSuccess: function (value) {
      success = value;
      alert = true;
    },
    getError: function () {
      return error;
    },
    setError: function (value) {
      error = value;
      alert = true;
    },
    reset: function () {
      success = {};
      error = {};
      alert = false;
    },
    hasAlert: function () {
      return alert;
    }
  }
});

angular.module('BookingManager.services', [])
  .factory('festivalEntry', function($resource) {
    return $resource('http://localhost:5000/festivals/:id', { id: '@_id' }, {
      update: {
        method: 'PUT' // this method issues a PUT request
      }
    });
  })
  .factory('login', function($resource){
    return $resource('http://localhost:5000/authenticate',{}, {
      check: {
        method: 'POST'
      }
    });
  });


