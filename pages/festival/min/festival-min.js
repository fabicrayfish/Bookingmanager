angular.module('festival', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider
    .when('/festival/:id', {
      templateUrl : 'pages/festival/festival.html',
      controller : 'MapController'
    })
    .when('/festival', {
      templateUrl : 'pages/festival/festival.html',
      controller : 'MapController'
    });
})

.controller('MapController', function($scope, festivalEntry, $routeParams){
    if ($routeParams.id) {
      var id = $routeParams.id;

      $scope.festivalEntry = festivalEntry.get({ id: id }, function(){});
    } else {
      $scope.festivalEntry = new festivalEntry;
    }


    var latlng = new google.maps.LatLng(50.110924, 8.682127);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    $scope.map = map;

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

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            $scope.map.fitBounds(place.geometry.viewport);
        } else {
            $scope.map.setCenter(place.geometry.location);
        }

        createMarker({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), address: place.formatted_address });
        fillInAddress(place);
    }

    var fillInAddress = function(place) {

      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };

      // Get each component of the address from the place details
      // and fill the corresponding field on the form.
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          console.log(addressType + ' = ' + val);
          //var model = $parse(addressType);
          $scope.festivalEntry[ addressType ] = val;
        }
      }
      $scope.$apply();
    }


    var createMarker = function (info) {
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.lng),
            title: info.address
        });
        marker.content = '<div class="infoWindowContent">' + info.address + '</div>';

        google.maps.event.addListener(marker, 'click', function () {
            //infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            //infoWindow.open($scope.map, marker);
        });
        //$scope.markers.push(marker);
    }

    $scope.submit = function() {
      if (!$scope.festivalEntry._id) {
        $scope.festivalEntry.$save(function() {
          console.log("created new entry");
        });
      } else {
        $scope.festivalEntry.$update(function(){
          console.log("updated");
        });
      }
    }


});


