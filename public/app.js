var app = angular.module('BookingManager', ['ngRoute', 'ngTouch', 'ngAnimate', 'ngResource', 'ngStorage', 'ngMaterial', 'ngAria', 'xeditable', 'angularUtils.directives.dirPagination', 'BookingManager.services', 'festival', 'list', 'login', 'emails', 'email', 'emaillog']);

app.config(function($locationProvider, $routeProvider, $httpProvider, $mdDateLocaleProvider) {
  $httpProvider.interceptors.push('authenticationInterceptor');
  $routeProvider.otherwise({redirectTo: '/festivals'});
  $mdDateLocaleProvider.formatDate = function(date) {
    return moment(date).format('DD-MM');
 };
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
      if(response.status == 401 || response.status == 403) {
        window.location = "/#/login";
      }
      return $q.reject(response);
    }
  }
});

app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (field(a) > field(b) ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
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
  .factory('festivalComment', function($resource) {
    return $resource('./api/festivals/:id/comments', { id: '@festivalId' }, {});
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
  .factory('emailsLogEntry', function($resource) {
    return $resource('./api/emailslog/:id', { id: '@_id' }, {});
  })
  .factory('login', function($resource){
    return $resource('./api/authenticate',{}, {
      check: {
        method: 'POST'
      }
    });
  });

  app.run(function(editableOptions, $rootScope) {
    //setup steps
    $rootScope.festivals = {
      "currentPage": 1,
      "sortKey": "",
      "reverse": false
    }
    //$rootScope.festivals.currentPage = 1;
    //test


    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
