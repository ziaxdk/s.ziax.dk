module.directive('ngToggleButton', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    template: '<button type="button" class="btn btn-info btn-sm" ng-click="click()">{{label}} *{{ngToggleButton}}*</button>',
    replace: true,
    scope: {
      ngToggleButton: '='
    },
    link: function (scope, element, attrs) {
      var labels = attrs.ngToggleButtonLabels.split(','),
          first = true;
      if (labels.length !== 2) throw Error("labels !== 2");



      scope.click = function () {
        first = !first;
        scope.ngToggleButton = "aaa"
        setLabel();
      }

      console.log(scope.ngToggleButton, scope, scope.$eval(scope.ngToggleButton), $parse(scope.ngToggleButton)(scope))

      setLabel();
      function setLabel () {
        scope.label = first ? labels[0] : labels[1];
      }
    }
  }
}]);
