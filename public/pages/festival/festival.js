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

    if ($routeParams.id) {
      var id = $routeParams.id;

      $scope.festivalEntry = festivalEntry.get({ id: id }, function(){
        if ($scope.festivalEntry.address.lat && $scope.festivalEntry.address.lng) {
          var endlatlng = new google.maps.LatLng($scope.festivalEntry.address.lat, $scope.festivalEntry.address.lng);
          setRoute(latlng, endlatlng);
        }
      });
    } else {
      $scope.festivalEntry = new festivalEntry;
    }

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var latlng = new google.maps.LatLng(49.994704, 8.669842);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsDisplay.setMap(map);
    $scope.map = directionsDisplay;


    var input = document.getElementById("map_search");
    var acOptions = {};
    //$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var autocomplete = new google.maps.places.Autocomplete(input, acOptions);

    console.log("setup autocomplete.");
    $scope.autocomplete = autocomplete;

    autocomplete.addListener('place_changed', function(){ setPlace(); });


    var setPlace = function () {
        //infoWindow.close();
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        $scope.festivalEntry.address.lat = place.geometry.location.lat();
        $scope.festivalEntry.address.lng = place.geometry.location.lng();

        setRoute(latlng, place.geometry.location, place, fillInAddress);

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
        if (!key == "lat" || !key == "len") {
          $scope.festivalEntry.address[key] = "";
        }
      });


      // Get each component of the address from the place details
      // and fill the corresponding field on the form.
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        $scope.festivalEntry.address[ addressType ] = "";
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          //var model = $parse(addressType);
          $scope.festivalEntry.address[ addressType ] = val;
        }
      }

      $scope.festivalEntry.address.distance = distance;

      $scope.$apply();
    }



    $scope.submit = function() {
      console.log($scope.festivalEntry.address.lat);
      if (!$scope.festivalEntry._id) {
        $scope.festivalEntry.$save(function() {
          console.log("created new entry");
        });
      } else {
        $scope.festivalEntry.$update(function(){
          console.log("updated");
        });
      }
      AlertService.setSuccess({msg: $scope.festivalEntry._id + ' has been updated successfully.'})
      window.location = "/#/list"
    }


});
