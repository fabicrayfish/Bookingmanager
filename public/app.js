var app = angular.module('BookingManager', ['ngRoute', 'ngResource', 'ngStorage', 'xeditable', 'angularUtils.directives.dirPagination', 'BookingManager.services', 'festival', 'list', 'login', 'emails']);

app.config(function($locationProvider, $routeProvider, $httpProvider) {
  $httpProvider.interceptors.push('authenticationInterceptor');
  $routeProvider.otherwise({redirectTo: '/list'});
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
        window.location = "/#/login";
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
    return $resource('./api/festivals/:id', { id: '@_id' }, {
      update: {
        method: 'PUT' // this method issues a PUT request
      },
      delete: {
        method: 'DELETE'
      }
    });
  })
    .factory('emailsEntry', function($resource) {
    return $resource('./api/emails/:id', { id: '@_id' }, {
      update: {
        method: 'PUT' // this method issues a PUT request
      },
      delete: {
        method: 'DELETE'
      }
    });
  })
  .factory('login', function($resource){
    return $resource('./api/authenticate',{}, {
      check: {
        method: 'POST'
      }
    });
  });

  app.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
