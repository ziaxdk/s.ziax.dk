module.directive('dashFacet', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    replace: true,
    // scope: {
    //   list: '@'
    // },
    // template: '<ul class="list-group facets clearfix">' +
    //     '<li ng-show="icon"><button class="btn btn-success" ng-click="ResultCtrl.allTypes()"><i class="{{icon}}"></i></button></li>' +
    //     '<li ng-repeat="hit in list track by hit.term">' +
    //       '<button class="btn" ng-class="{\'btn-default\': !hit.selected, \'btn-primary\': hit.selected}" ng-click="ResultCtrl.facet(hit)">{{hit.term}} <i class="badge">{{hit.count}}</i></button>' +
    //     '</li>' +
    //   '</ul>',
    link: function(scope, element, attrs) {
    }
  }; 
}]);
