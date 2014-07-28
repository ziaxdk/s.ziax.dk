module.controller('NewController', ['$scope', '$http', '$state', 'NewApiResult', 'Result', 'PlaceService', 'DelayerFactory', 'DocumentService', 'TypeService', 'GazService', 'GPS',
  function ( $scope, $http, $state, NewApiResult, Result, PlaceService, DelayerFactory, DocumentService, TypeService, GazService, GPS ) {
    $scope.form = { };
    $scope.meta = {
      coords: GPS.coords
    };

    $scope.submit = function() {
      var f = $scope.form;
      var save = angular.extend(f, {
        type: $state.current.data.type,
        tags: !f.tags ? [] : f.tags.split(','),
        onlyAuth: !!f.onlyAuth

      });

      console.log('submit', save);
      // DocumentService.store(save);
    };





    return;
    /*var id,
        type,
        watcher;
    $scope.meta = {
      coords: GPS.coords
    };
    $scope.form = { };
    $scope.$watch('meta.type', function(val) {
      scopeType(TypeService.getType(val));
      if ( GPS.coords.hasFix && val === 'place' && !$scope.form.input ) {
        $scope.form.input = GPS.coords.lat.toFixed(4) + ',' + GPS.coords.lon.toFixed(4);
      }
    });

    $scope.submit = function() {
      var f = $scope.form;
      // console.log('$scope.form', f);
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
      $scope.disable = false;
      if (angular.isFunction(obj.initFn)) {
        obj.initFn.call($scope.meta, $scope);
      }
    }*/

}])
.controller('NewArticleController', ['$scope', function($scope) {

}])
.controller('NewLinkController', ['$scope', function($scope) {

}])
.controller('NewPlaceController', ['$scope', function($scope) {

}])
.controller('NewGazController', ['$scope', function($scope) {

}])
.controller('NewFlightController', ['$scope', function($scope) {

}]);
