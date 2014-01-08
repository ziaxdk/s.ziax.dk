module.directive('zMessage', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  return {
    restrict: 'A',
    template: 
    '<div class="z-msg" ng-show="enable">' +
    '  <div class="container">' +
    '    <div class="row">{{msg}}123</div>' +
    '  </div>' +
    '</div>',
    replace: true,
    scope: { },
    link: function ($scope, $element, $attrs) {
      $scope.msg = "foobar";
      $rootScope.$on('err', function (event, data) {
        $scope.msg = '(' + data.num + ') ' + data.msg;
        $scope.enable = true;
        $timeout(function () {
          $scope.enable = false;
        }, 2000);

      })
    }
  }
}]);
