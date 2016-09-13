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
  var initDate = function() {
    $scope.email.startdate = "";
    $scope.email.endDate = "";
  }




  var setupEmail = function() {
    if ($routeParams.id) {
      var id = $routeParams.id;
      var emailQuery = emailsEntry.get({ id: id })
      emailQuery.$promise.then(function(data){
        $scope.email = data;
        if ($scope.email.startDate === null || typeof $scope.email.startDate === "undefined") {
          console.log("undefined startDate");
          initDate();
        }
      });
    } else {
      console.log("new entry");
      $scope.email = new emailsEntry;
      //initDate();
    }
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
    //setDateForRESTCall();
    console.log($scope.email);
    if (!$scope.email._id) {
      $scope.email.$save(function() {});
    } else {
      $scope.email.$update(function(){});
    }
    AlertService.setSuccess({msg: $scope.email.subject + ' has been updated successfully.'})
    //window.location = "/#/emails"
  }
  $scope.today = function() {
    $scope.email.startDate = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.email.endDate = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }

});
