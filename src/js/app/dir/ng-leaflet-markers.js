module.directive('zIcons', [function() {
  return {
    scope: {
      zIcons: '='
    },
    template: '<dash-leaflet-markers icon="zIcons">' +
      '  <dash-leaflet-marker icon="cutlery"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="coffee"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="shopping-cart"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="eye"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="camera"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="home"></dash-leaflet-marker>' +
      '</dash-leaflet-markers>'
  };
}])
.directive('dashLeafletMarkers', ['$parse', 'PlaceService', function ($parse, PlaceService) {
  var _iconG, _iconS;
  return {
    restrict: 'E',
    template: '<div class="clearfix" ng-transclude></div>',
    replace: true,
    transclude: true,
    controller: ['$scope', function ($scope) {
      // console.log('done');
      this.setIcon = function (icon) {
        _iconS($scope, icon);
        // console.log(icon)
      };

    }],
    link: function(scope, element, attrs) {
      _iconG = $parse(attrs.icon);
      _iconS = _iconG.assign;

    }
  };
}])
.directive('dashLeafletMarker', ['$parse', 'PlaceService', function ($parse, PlaceService) {
  var parent;
  return {
    restrict: 'E',
    template: '<a href="javascript:;" ng-click="click()"><div class="awesome-marker-icon-{{color}} awesome-marker" style="position: relative; float: left"><i class="fa fa-{{icon}}" style="color: white"></i></div></a>',
    replace: true,
    scope: {

    },
    require: '?^dashLeafletMarkers',
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

      $scope.click = function (icon) {
        parent.setIcon($scope.icon);
      };
    }],
    link: function(scope, element, attrs, ctrl) {
      var poi = PlaceService.getPoi(attrs.icon);
      scope.icon = poi.name;
      scope.color = poi.color;
      parent = ctrl;
    }
  };
}]);