module.controller('ShowController', ['Result', '$http', function (Result, $http) {
  this.Result = Result.data;

  // if (this.Result.source.location) {
  //   this.Result.source.location.leaflet = this.Result.source.location.lat + ',' + this.Result.source.location.lon;
  // }
}]);
