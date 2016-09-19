angular.module('festival', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider
    .when('/festival/:id', {
      templateUrl : 'pages/festival/festival.html',
      controller : 'FestivalCtrl'
    })
    .when('/festival', {
      templateUrl : 'pages/festival/festival.html',
      controller : 'FestivalCtrl'
    });
})

.controller('FestivalCtrl', function($scope, festivalEntry, $routeParams, AlertService){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var rehearsalRoom = new google.maps.LatLng(49.994704, 8.669842);

    var setupFestival = function() {
      if ($routeParams.id) {
        var id = $routeParams.id;
        $scope.festivalEntry = festivalEntry.get({ id: id }, function(){
          setRouteIfAddressIsSet();
        });
      } else {
        $scope.festivalEntry = new festivalEntry;
      }
    }

    var setRouteIfAddressIsSet = function() {
      if ($scope.festivalEntry.address){
        if ($scope.festivalEntry.address.lat && $scope.festivalEntry.address.lng) {
          var endlatlng = new google.maps.LatLng($scope.festivalEntry.address.lat, $scope.festivalEntry.address.lng);
          setRoute(rehearsalRoom, endlatlng);
        }
      }
    }

    var setupSelects = function() {
      $scope.contactTypes = [
        {text: 'email'},
        {text: 'homepage'},
        {text: 'facebook'}
      ];

      $scope.statusTypes = [
        {text: 'nicht versendet'},
        {text: 'versendet'}
      ];

      $scope.responseTypes = [
        {text: 'Zusage'},
        {text: 'Absage'},
        {text: 'Empfangsbestätigung'}
      ];
    }

    var setupMap = function() {
      $scope.map = getMap();
      setupAutofillForSearchingMap("map_search");
    }

    var getMap = function() {
      var myOptions = {
        zoom: 8,
        center: rehearsalRoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
      };
      var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      directionsDisplay.setMap(map);

      return directionsDisplay;
    }

    var setupAutofillForSearchingMap = function(inputName){
      var input = document.getElementById(inputName);
      var acOptions = {};
      var autocomplete = new google.maps.places.Autocomplete(input, acOptions);

      $scope.autocomplete = autocomplete;

      autocomplete.addListener('place_changed', function(){ setPlace(autocomplete); });
    }

    setupFestival();
    setupSelects();
    setupMap();

    var setPlace = function (autocomplete) {

        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        if (!$scope.festivalEntry.address) {
          $scope.festivalEntry.address = {};
        }

        $scope.festivalEntry.address.lat = place.geometry.location.lat();
        $scope.festivalEntry.address.lng = place.geometry.location.lng();

        setRoute(rehearsalRoom, place.geometry.location, place, fillInAddress);

    }

    var setRoute = function(start, end, place, callback) {
      var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
      };

      var distance = ""
      
      directionsService.route(request, function(result, status) {
        if (status == 'OK') {
          distance = result["routes"][0]["legs"][0]["distance"]["text"];
          if (callback) {
            callback(place, distance);
          }
          directionsDisplay.setDirections(result);
        }
      });
    }

    var fillInAddress = function(place, distance) {

      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };

      angular.forEach($scope.festivalEntry.address, function(value, key){
        if (key != "lat" && key != "lng") {
          $scope.festivalEntry.address[key] = "";
        }
      });


      // Get each component of the address from the place details
      // and fill the corresponding field on the form.
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          $scope.festivalEntry.address[ addressType ] = val;
        }
      }

      $scope.festivalEntry.address.distance = distance;

      $scope.$apply();
    }

    $scope.addRow = function() {
      $scope.festivalEntry.dates.push({"date" : Date.now(),
            "deadline" : Date.now(),
            "contactType" : "email",
            "status": "not sent"});
    }

    $scope.removeRow = function (idx) {
      $scope.festivalEntry.dates.splice(idx, 1);
    };


    $scope.backToList = function() {
        window.location = "/#/festivals"
    }

    $scope.delete = function() {
      if ($scope.festivalEntry._id) {
        $scope.festivalEntry.$delete(function() {});
        AlertService.setSuccess({msg: $scope.festivalEntry.festivalName + ' has been deleted.'})
        window.location = "/#/festivals"
      }
    }


    $scope.submit = function() {
      if (!$scope.festivalEntry._id) {
        $scope.festivalEntry.$save(function() {});
      } else {
        $scope.festivalEntry.$update(function(){});
      }
      AlertService.setSuccess({msg: $scope.festivalEntry.festivalName + ' has been updated successfully.'})
      window.location = "/#/festivals"
    }


});
