module.directive('zSuggest', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    scope: { zSuggest: '=' },
    template: 
    '<div class="z-suggest" ng-show="data.length != 0">' +
      '<ul>' +
        '<li ng-repeat="d in data" ng-class="{selected: $index == index}">{{d.dis}}</li>' +
      '</ul>' +
    '</div>',
    controller: ['$scope', '$element', '$attrs', function(scope, element, attrs) {
        scope.data = [];
        scope.index = -1;
        scope.$watch('zSuggest', function(n) {
          if (!n) return;
          scope.data.push({dis:n});
          console.log('val', n);
        });

        function reset() {
          scope.index = -1;
          scope.data = [];
        }
        function down() {
          if (scope.data.length - 1 == scope.index) return;
          ++scope.index;
        }
        function up() {
          if (scope.index == -1) return;
          --scope.index;
        }
  
        angular.element(element).parent().find('input').on('keydown', function(evt) {
          var code = evt.keyCode;
          console.log('code', code);
          switch(code) {
            case 40: // down
              down();
              break;
  
            case 38: // up
              up();
              break;

            case 27: // esc
              reset();
              break;

            default:
              break;
          }
          scope.$apply();
        });
      }
    ]};
}]);

// module.directive('zuggest', ['$compile', function ($compile) {
//   return {
//     restrict: 'E',
//     link: function(scope, element, attrs) {
//       console.log('link');
//     }
    
//   }
// }]);

// module.directive('zuggest', ['$compile', function ($compile) {
//   return {
//     restrict: 'E',
//     scope: { },
//     transclude: true,
//     replace: true,
//     template: '<div><div ng-transclude></div><div>*</div></div>',
//     link: function(scope, element, attrs) {
//       console.log('link');
//     }
//     // compile: function(tElement) {
//     //   var html = $compile('<div class="z-suggest">' +
//     //     '<ul>' +
//     //     '<li ng-repeat="d in data" ng-class="{selected: $index==index}">{{d.d}}</li>' +
//     //     '</ul>' +
//     //     '</div>');

//     //   return function link(scope, element, attrs) {
//     //     tElement.after(html(scope));


//     //     var data = [{d: '1'}, {d: '2'}, {d: '3'}, {d: '4'}];

//     //     scope.data = data;
//     //     scope.index = -1;

//     //     tElement.on('keyup', function(evt) {
//     //       var code =  evt.keyCode;
//     //       console.log(code);
//     //       switch(code) {
//     //         case 40: // down
//     //           console.log('down');
//     //           scope.index++;
//     //           break;
//     //         case 38: // up
//     //           if (scope.index == -1) return;
//     //           scope.index--;
//     //           break;
//     //       }
//     //     });
//     //   };
//     // }
//   };
// }]);
