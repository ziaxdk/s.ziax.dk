module.directive('zInputNew', [ 'TypeService', 'LocationService', 'DelayerFactory', '$http',
  function ( TypeService, LocationService, DelayerFactory, $http ) {
  return {
    restrict: 'A',
    scope: {
      context: '=',
      header: '=',
      content: '='
    },
    require: 'ngModel',
    replace: true,
    template:
      '<div ng-form="formQ">' +
        '<div class="form-group" ng-class="{\'has-error\': formQ.q.$invalid }">' +
          '<input type="text" class="form-control" placeholder="Enter something..." name="q" ng-model="form.q" ng-required="!edit">' +
        '</div>' +
        '<ul class="list-group facets clearfix">' +
          '<li ng-repeat="type in types">' +
            '<button type="button" class="btn btn-sm" ng-class="{\'btn-primary\': context === type, \'btn-default\': context !== type}" ng-click="setContext(type)" ng-disabled="edit">{{type}}</button>' +
          '</li>' +
        '</ul>' +
      '</div>',
    link: function(scope, element, attrs, ngModelCtrl) {
      var delayScraper = new DelayerFactory(2000);

      scope.edit = !!scope.context;
      scope.form = { };
      scope.types = TypeService.types();
      scope.$watch('form.q', updateModel);
      
      scope.setContext = function(ctx) {
        if (ctx === scope.clickType) {
          scope.context = scope.clickType = undefined;
          parseContext(scope.form.q);
        }
        else {
          scope.context = scope.clickType = ctx;
          // console.log('click', LocationService.coords);
        }
      };

      ngModelCtrl.$render = function() {
        scope.form.q = ngModelCtrl.$isEmpty(ngModelCtrl.$viewValue) ? undefined : ngModelCtrl.$viewValue;
      };

      function updateModel(val) {
        // console.log('updateModel', val);
        ngModelCtrl.$setViewValue(val);
        // ngModelCtrl.$render();
        //   //Nothing to render...
        if (!scope.edit && !scope.clickType)
          parseContext(val);
      }

      function parseContext(val) {
        if (/undefined/.test(val))
        {
          scope.context = undefined;
        }
        else if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(val)) {
          scope.context = 'place';
        }
        else if (/^https?\:\/\//.test(val)) {
          scope.context = 'link';
          delayScraper.run(function () {
            $http.get('/api/scrape', { params: { q: encodeURIComponent(val) } }).success(function (data) {
              scope.header = data.title1 || data.title2 || data.title3 || '';
              scope.content = '"' + val + '":' + val + '\n\n' + (data.desc1 || data.desc2 || data.desc3 || '');
            });
          });
        }
        else
        {
          scope.context = 'article';
        }
      }
    }
  };
}]);