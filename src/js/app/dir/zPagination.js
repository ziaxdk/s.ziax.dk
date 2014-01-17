module.directive('zPagination', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    replace: true,
    template:
      '<div>' +
      '<ul class="pagination">' +
        '<li ng-repeat="n in data" ng-class="{active: idx+1 == n.idx}"><a href="javascript:;" ng-click="click(n)">{{n.idx}}</a></li>' +
      '</ul></div>',
    scope: {
      change: '&',
      idx: "="
    },
    controller: ['$scope', function ($scope) {
      $scope.click = function(n) {
        $scope.idx = n.idx - 1;
      };
    }],

    link: function(scope, element, attrs) {
      var size = 10;
      scope.data = [];

      attrs.$observe('count', function(value) {
        var num = Math.ceil(value / size);
        var data = [];
        for (var i = 0; i < num; i++) {
          data.push({idx: i + 1});
        }
        scope.data = data;
      });
    }
  };
}]);
