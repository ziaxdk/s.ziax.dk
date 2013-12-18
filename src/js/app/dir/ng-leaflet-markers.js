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
        _iconS($scope, icon);
        // console.log(icon)
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
    { name: 'camera', color: 'orange' },
    { name: 'home', color: 'red' }
  ];
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