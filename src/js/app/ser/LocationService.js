module.service('LocationService', ['$window', '$rootScope', function ($window, $rootScope) {
	var coords = {
    hasFix: false,
    lat: 0, 
    lon: 0
  };
	
  function whenLocated (position) {
    var c = position.coords;
    // console.log(c);
    $rootScope.$apply(function () {
      coords.hasFix = true;
      coords.lat = c.latitude;
      coords.lon = c.longitude;
    });
	};

	if (navigator.geolocation) {
		// navigator.geolocation.getCurrentPosition(whenLocated);
		navigator.geolocation.watchPosition(whenLocated);
	}
	else {
		console.log('location not supported');
	};

	return {
		coords: coords
	};
}]);
