module.controller('IndexController', ['History', 'LocationService', '$location', '$scope',
  function (History, LocationService, $location, $scope) {
  var _t = this;
  _t.history = History.data.facets.history.terms;
  _t.showInfo = false;
  

  _t.search = function (q) {
    $location.path('res/' +  encodeURIComponent(q.term));
  };

  _t.toggle = function () {
    _t.showInfo = !_t.showInfo;
  };

  $scope.$watch(function () {return LocationService.coords; }, function (n) {
    if (!n.hasFix) return;
    console.log('latlon', n);
  });
}]);
