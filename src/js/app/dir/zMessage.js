module.directive('zMessage', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  return {
    restrict: 'A',
    template: 
    '<div class="z-msg">' +
    '      <ul>' +
    '        <li ng-repeat="m in msgs track by $index" ng-class="m.cls">{{m.msg}}</li>' +
    '      </ul>' +
    '</div>',
    replace: true,
    scope: { },
    link: function ($scope, $element, $attrs) {
      $scope.msgs = [];

      function addMsg(type, msg, num) {
        if (num> 0) {
          $scope.msgs.push({cls: 'err', msg: '(' + num + ') ' + msg});
        }
        else {
          $scope.msgs.push({cls: 'ok', msg: msg});
        }

        $timeout(function () {
          $scope.msgs.pop();
        }, 4000);
      }


      $rootScope.$on('err', function (event, data) {
        addMsg('err', data.msg, data.num);
      })
      $rootScope.$on('ok', function (event, data) {
        addMsg('ok', data.msg);
      })
    }
  }
}]);
