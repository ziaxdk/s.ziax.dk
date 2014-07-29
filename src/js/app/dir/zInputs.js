module.directive('zInputNew', [ 'TypeService', 'LocationService', 'DelayerFactory', '$http', '$state', '$rootScope',
  function ( TypeService, LocationService, DelayerFactory, $http, $state, $rootScope ) {
  return {
    restrict: 'A',
    scope: {
      context: '=',
      header: '=',
      content: '=',
      disable: '='
    },
    require: 'ngModel',
    replace: true,
    template:
      '<div ng-form="formQ" ng-if="!disable">' +
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
.directive('zAirport', ['DelayerFactory', 'ApiTypeFactory', '$http', '$parse',
  function(DelayerFactory, ApiTypeFactory, $http, $parse) {
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      zAirport: '=',
      zAirportRoute: '=',
      zAirportPreview: '=?',
    }, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    template: '<div>' +
    '<div class="form-group">' +
      '<label for="idAirport">Airport</label>' +
      '<input type="text" name="airport" class="form-control" id="idAirport" ng-model="form.q" ng-keydown="keyDown($event)">' +
    '</div>' +
    '<div class="form-group">' +
      '<div class="list-group" style="position: absolute; z-index: 50000; border: 1px solid black; background-color: white" ng-show="results">' +
        '<table class="table table-striped table-hover scroll-table">' +
          '<thead>' +
            '<tr>' +
              '<th style="width: 80px">#</th>' +
              '<th style="width: 80px">IATA</th>' +
              '<th style="width: 80px">ICAO</th>' +
              '<th style="width: 280px">Name</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody style="">' +
            '<tr ng-repeat="a in results track by a.id" ng-click="select(a)" ng-class="{active: $index === index}" ng-mouseenter="preview(a)">' +
              '<td style="width: 80px">{{$index+1}}</td>' +
              '<td style="width: 80px">{{a.source.airport_iata}}</td>' +
              '<td style="width: 80px">{{a.id}}</td>' +
              '<td style="width: 280px">{{a.source.header}}</td>' +
            '</tr>' +
          '</tbody>' +
          '<tfoot>' +
            '<tr ng-show="total > 10">' +
              '<td style="width: 520px; text-align: center">Total {{total}}</td>' +
            '</tr>' +
          '</tfoot>' +
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
          delayPreview = new DelayerFactory(1000),
          uri = ApiTypeFactory('search').uri,
          q = '',
          offset = 0;

      scope.results = [];
      reset();

      scope.$watch('form.q', updateModel);

      scope.select = select;

      scope.keyDown = function(e) {
        if (scope.results.length === 0) return;
        var code = e.keyCode;
        // console.log('code', code);
        switch(code) {
          case 40: // down
            nav(+1, e);
            break;

          case 38: // up
            nav(-1, e);
            break;

          case 27: // esc
            nav(0, e);
            break;

          case 13: // Return
            sel(e);
            break;
        }
      };

      scope.preview = function(airport) {
        delayPreview.run(function() {
          scope.zAirportPreview = airport.source.location;
        });
      };

      function sel(e) {
        e.preventDefault();
        select(scope.results[scope.index]);
      }

      function nav(count, e) {
        e.preventDefault();
        if (count === 0) {
          reset();
          scope.results = [];
          return;
        }
        // if ((scope.index + count) === -1 || (scope.index + count) === scope.results.length) return;
        if ((scope.index + count) === -1) return;
        if ((scope.index + count) === scope.results.length) {
          // console.log('get', offset, offset+=10);
          offset += 10;
          if (offset > scope.total) return;
          getAirports(q);
        }

        
        scope.index = scope.index + count;
      }

      function reset() {
        scope.form = { };
        scope.index = -1;
        scope.results = [];
        scope.total = 0;
      }

      function select(airport) {
        delayPreview.cancel();
        scope.zAirport.push(airport);
        var _text = [];
        angular.forEach(scope.zAirport, function(v) {
          var s = v.source;
          _text.push( s.airport_iata ? s.airport_iata : s.airport_ident );
        });
        scope.zAirportRoute = _text.join('-');
        reset();
      }

      function getAirports(input) {
        return $http.post('/api/airport', { q: input, offset: offset }).success(function(data) {
            q = input;
            scope.index = -1;
            scope.total = 0;
            scope.results = scope.results.concat(data.hits.hits);
            scope.total = data.hits.total;
          });
      }

      function updateModel(n) {
        if (!n) {
          scope.results = [];
          delayScraper.cancel();
          return;
        }
        delayScraper.run(function () {
          //TODO: Refactor this (with ResultController) into factory....
          // $http.post(uri, { q: n, facets: { tags: { terms: [], operator: 'or' } }, types: 'airport', pager: { idx: 0 } }).success(function (data) {
          offset = 0;
          getAirports(n);
        });
      }
    }
  };
}])
.directive('zStations', [function() {
  return {
    restrict: 'A',
    template: '<div>' +
      '<label for="idStation"><a href="javascript:;" ng-click="toggle()">Station</a></label>' +
      '<div ng-if="!bToggle">' +
        '<select class="form-control" ng-model="$parent.station" ng-options="station.id as station.display for station in stations"></select>' +
      '</div>' +
      '<div ng-if="bToggle">' +
        '<div z-map z-map-marker="location" z-map-marker-icon="tint" style="height: 300px"></div>' +
      '</div>' +
    '</div>',
    scope: {
      station: '=zStations'
    },
    controller: ['$scope', 'GazService', 'GPS', function($scope, GazService, GPS) {
      $scope.bToggle = false;
      $scope.f = 'buu';
      $scope.station = {};
      $scope.toggle = function() {
        $scope.bToggle = !$scope.bToggle;
      };

      var watcher = $scope.$watch(function() { return GPS.coords; }, function(val) {
        if (!val || !val.hasFix) return;
        console.log('pos', val);
        $scope.location = val.lat + ', ' + val.lon;
        GazService.stationsNear(val).success(function(es) {
          $scope.stations = es.hits.hits;
          if ($scope.stations.length !== 0) {
            $scope.station = $scope.stations[0].id;
            angular.forEach($scope.stations, function(v) {
              v.display = v.source.name + ' (' + v.sort[0].toFixed(2) + ')';
            });
          }
          $scope.stations.push({ id: 'new', display: 'new...'});



        });
      }, true);

      $scope.$on('$destroy', function() {
        watcher();
      });

    }]
    // link: function(scope, element, attrs) {
    // }
  };
}]);
