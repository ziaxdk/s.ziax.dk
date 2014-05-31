module.service('GazService', ['$http', 'MessageService', function ($http, MessageService) {
  this.stationsNear = function(coords) {
    return $http.post('/api/stations_near', coords);
  };

  this.vehicles = function() {
    return $http.post('/api/vehicle/list');
  };
}]);
