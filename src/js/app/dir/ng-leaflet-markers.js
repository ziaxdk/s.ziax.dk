module.directive('dashLeafletMarkers', ['$parse', function ($parse) {
  var _iconG, _iconS;
  return {
    restrict: 'E',
    template: '<div class="clearfix" ng-transclude></div>',
    replace: true,
    transclude: true,
    controller: ['$scope', function ($scope) {
      // console.log('done');
      this.setIcon = function (icon) {
        console.log('setIcon', icon);
        _iconS($scope, icon);
      }

    }],
    link: function(scope, element, attrs) {
      _iconG = $parse(attrs.icon);
      _iconS = _iconG.assign;

    }
  }
}]);

module.directive('dashLeafletMarker', ['$parse', function ($parse) {
  var parent,
   icons = [
    { name: 'cutlery', color: 'cadetblue' },
    { name: 'coffee', color: 'darkred' },
    { name: 'shopping-cart', color: 'darkgreen' },
    { name: 'eye', color: 'blue' },
    { name: 'camera', color: 'orange' }
  ];
  return {
    restrict: 'E',
    template: '<div class="awesome-marker-icon-{{color}} awesome-marker" style="position: relative; float: left" ng-click="click()"><i class="fa fa-{{icon}}" style="color: white"></i></div>',
    replace: true,
    scope: {

    },
    require: '^dashLeafletMarkers',
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

      $scope.click = function (icon) {
        parent.setIcon($scope.icon);
      }
    }],
    link: function(scope, element, attrs, ctrl) {
      parent = ctrl;
      icons.forEach(function (v) {
        if (v.name === attrs.icon) {
          scope.icon = v.name;
          scope.color = v.color;

        }
      });
      // console.log(arguments);
    }
  }
}]);