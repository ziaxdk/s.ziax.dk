module.controller('NewController', ['$scope', '$route', '$http', 'NewApiResult', 'Result', 'PlaceService', 'DelayerFactory', 'DocumentService', 'TypeService', 'LocationService',
  function ( $scope, $route, $http, NewApiResult, Result, PlaceService, DelayerFactory, DocumentService, TypeService, LocationService ) {
    var id,
        type;
    $scope.meta = { };
    $scope.form = { };
    $scope.$watch('meta.type', function(val) {
      scopeType(TypeService.getType(val));
      if ( LocationService.coords.hasFix && val === 'place' && !$scope.form.input ) {
        $scope.form.input = LocationService.coords.lat.toFixed(4) + ',' + LocationService.coords.lon.toFixed(4);
      }
    });

    $scope.submit = function() {
      var f = $scope.form;
      console.log('$scope.form', f);
      var save = angular.extend(type.storeFn.call(f, $scope.meta), {
        id: id,
        type: type.name,
        tags: !f.tags ? [] : f.tags.split(','),
        onlyAuth: !!f.onlyAuth
      });

      // console.log('submit', save);
      DocumentService.store(save);
    };

    if (Result && Result.data) {
      var _d = Result.data;
      $scope.meta.type = _d.type;
      id = _d.id;
      TypeService.getType(_d.type).fetchFn.call($scope.form, _d.source);
      $scope.form.onlyAuth = _d.source.onlyAuth;
      $scope.form.tags = angular.isArray(_d.source.tags) ? _d.source.tags.join() : _d.source.tags;
    }

    function scopeType(obj) {
      if (!obj) return;
      type = obj;
      $scope.meta.type = obj.name;
      $scope.template = obj.template;
      $scope.preview = obj.preview;
      if (angular.isFunction(obj.initFn)) {
        obj.initFn.call($scope.meta, $scope);
      }
    }

}]);
