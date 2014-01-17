module.directive('zPagination', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    replace: true,
    template: 
    '<div>' +
    '<ul class="pagination">' +
      '<li ng-repeat="n in data" ng-class="{active: idx == n.idx}"><a href="javascript:;" ng-click="click(n)">{{n.idx}}</a></li>' +
    '</ul></div>',
    scope: {
      change: '&'
    },
    controller: ['$scope', function ($scope) {
      $scope.click = function(n) {
        // console.log(this, n, $scope)
        $scope.change({idx: n.idx - 1});
      }
    }],
    link: function(scope, element, attrs) {
      var size = 10;
      scope.idx = 0;
      scope.data = [];
      // console.log('link', arguments);
      // attrs.$observe(attrs.count, function (value) {
      //   console.log(value)
      // })

      // console.log(attrs.count)

      attrs.$observe('idx', function(value) {
        scope.idx = value;
      });
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
