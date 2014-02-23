module.service('AirportService', ['$http', function ($http) {
  function get(code) {
    return $http.get('/api/airport', { params: { code: code } });
  }

  return {
    get: get
  };
}]);
