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
}])
.directive('zAirport', ['DelayerFactory', 'ApiTypeFactory', '$http',
  function(DelayerFactory, ApiTypeFactory, $http) {
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      zAirport: '=',
      zAirportRoute: '=',
    }, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    template: '<div>' +
    '<div class="form-group">' +
      '<label for="idAirport">Airport</label>' +
      '<input type="text" name="airport" class="form-control" id="idAirport" ng-model="form.q">' +
    '</div>' +
    '<div class="form-group">' +
      '<div class="list-group" style="position: absolute; z-index: 50000; border: 1px solid black; background-color: white" ng-show="results">' +
        '<table class="table table-striped table-hover">' +
          '<thead>' +
            '<tr>' +
              '<th>#</th>' +
              '<th>IATA</th>' +
              '<th>ICAO</th>' +
              '<th>Name</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr ng-repeat="a in results track by a.id" ng-click="select(a)">' +
              '<td>{{$index+1}}</td>' +
              '<td>{{a.source.airport_iata}}</td>' +
              '<td>{{a.id}}</td>' +
              '<td>{{a.source.header}}</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '</div>',
    // templateUrl: '',
    replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function(scope, iElm, iAttrs, controller) {
      var delayScraper = new DelayerFactory(700),
          uri = ApiTypeFactory('search').uri;

      scope.form = { };
      scope.results = [];

      scope.$watch('form.q', updateModel);

      scope.select = function(airport) {
        scope.zAirport.push(airport);
        scope.results = [];
        var _text = [];
        angular.forEach(scope.zAirport, function(v) {
          var s = v.source;
          _text.push( s.airport_iata ? s.airport_iata : s.airport_ident );
        });
        scope.zAirportRoute = _text.join('-');
        scope.form.q = undefined;
      };

      function updateModel(n) {
        if (!n) {
          scope.results = [];
          return;
        }
        delayScraper.run(function () {
          //TODO: Refactor this (with ResultController) into factory....
          $http.post(uri, { q: n, facets: { tags: { terms: [], operator: 'or' } }, types: 'airport', pager: { idx: 0 } }).success(function (data) {
            scope.results = data.hits.hits;
          });
        });
      }
    }
  };
}]);