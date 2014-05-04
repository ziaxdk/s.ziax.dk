module.service('LocationService', ['$window', '$rootScope', function ($window, $rootScope) {
	var watchId,
      coords = {
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
	}

  function start() {
    if (watchId) return;
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(whenLocated);
      watchId = navigator.geolocation.watchPosition(whenLocated);
    }
    else {
      console.log('location not supported');
    }
  }

  function stop() {
    if (!watchId) return;
    navigator.geolocation.clearWatch(watchId);
    watchId = undefined;
  }



	return {
		coords: coords,
    start: start,
    stop: stop
	};
}]);
