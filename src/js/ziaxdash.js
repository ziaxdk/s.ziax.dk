(function () {
var module = angular.module('ziaxdash', ['ngRoute', 'ngResource', 'ngAnimate']);
module.provider('GPS', function() {
  var _intervalMilli;
  
  this.intervalVariable = function(value) {
    _intervalMilli = value;
  },

  this.$get = ['$interval', '$rootScope', function ($interval, $rootScope) {
    var watchId,
        intervalId,
        updated = false,
        oldCoords,
        coords = {
          hasFix: false,
          lat: 0,
          lon: 0
        };
  
  function whenLocated (position) {
    if (updated || (oldCoords && oldCoords.latitude == position.latitude && oldCoords.longitude == position.longitude)) return;
    console.log('Updated', position);
    // angular.extend($rootScope[_rootScopeName], coords, { hasFix: true });
    // angular.extend(coords, position, { hasFix: true });
    coords.lat = position.coords.latitude;
    coords.lon = position.coords.longitude;
    coords.hasFix = true;
    $rootScope.$apply();
    updated = true;
    oldCoords = coords;
  }

  function start() {
    if (watchId) return;
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(whenLocated);
      intervalId = $interval(function() { updated = false; }, _intervalMilli || 5000);
      watchId = navigator.geolocation.watchPosition(whenLocated);
      console.log('GPS start');
    }
    else {
      console.log('location not supported');
    }
  }

  function stop() {
    if (!watchId) return;
    navigator.geolocation.clearWatch(watchId);
    watchId = undefined;
    $interval.cancel(intervalId);
    intervalId = undefined;
      console.log('GPS stop');
  }

  function reset() {
    updated = false;
  }



  return {
    coords: coords,
    start: start,
    stop: stop,
    reset: reset
  };
}]});



// module.provider('GPS123', function() {
//   var _rootScopeName, _intervalMilli;
  
//   this.rootScopeVariable = function(name) {
//     _rootScopeName = name;
//   },
//   this.intervalVariable = function(value) {
//     _intervalMilli = value;
//   },

//   this.$get = ['$rootScope', '$interval', function($rootScope, $interval) {
//     var watchId,
//         intervalId,
//         updated = false,
//         oldCoords;


//     function startGps() {
//       console.log('Starting GPS');
//       if (watchId) return;
//       $rootScope[_rootScopeName] = { hasFix: false };
//       intervalId = $interval(function() { updated = false; }, _intervalMilli || 5000);

//       watchId = window.navigator.geolocation.watchPosition(function(position) {
//         update(position.coords);
//       }, function(err) {
//         alert(err);
//       }, {
//         maximumAge: 10,
//         timeout: 90000,
//         enableHighAccuracy: true
//       });
//       console.log('GPS started', watchId);
//     }

//     function stopGps() {
//       console.log('Stopping GPS');
//       if (!watchId) return;
//       window.navigator.geolocation.clearWatch(watchId);
//       watchId = undefined;
//       $interval.cancel(intervalId);
//       intervalId = undefined;
//     }

//     function update(coords) {
//       if (updated || (oldCoords && oldCoords.latitude == coords.latitude && oldCoords.longitude == coords.longitude)) return;
//       console.log('Updated', coords);
//       angular.extend($rootScope[_rootScopeName], coords, { hasFix: true });
//       $rootScope.$apply();
//       updated = true;
//       oldCoords = coords;
//     }

//     function reset() {
//       updated = false;
//     }

//     return {
//       startGps: startGps,
//       stopGps: stopGps,
//       reset: reset
//     };
//   }];
// });

// Config
module.config(['$routeProvider', '$sceDelegateProvider', '$provide', '$httpProvider', 'GPSProvider', function ($routeProvider, $sceDelegateProvider, $provide, $httpProvider, GPSProvider) {
  $routeProvider.when('/', {
      templateUrl: "/html/_index.html",
      resolve: { History: ['$http', function($http) { return $http.get('/api/history'); }] },
      controller: "IndexController",
      controllerAs: "IndexCtrl"
  });
  $routeProvider.when('/new', {
      templateUrl: "/html/_new.html",
      resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: "NewController",
      controllerAs: "NewCtrl"
  });
  $routeProvider.when('/edit/:type/:id', {
      templateUrl: "/html/_new.html",
      resolve: {// TODO: Create mulitple GET
        Result: ['$route', '$http', function($route, $http) { return $http.post('/api/q', { id: $route.current.params.id, type: $route.current.params.type }); }],
        NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }]
      },
      controller: "NewController",
      controllerAs: "NewCtrl"
  });
  $routeProvider.when('/show/:type/:id', {
      templateUrl: "/html/_show.html",
      // resolve: { Drive: ['$route', 'RestQ', function($route, RestQ) { return RestQ.save({ id: $route.current.params.id, type: $route.current.params.type }); }] },
      resolve: { Result: ['$route', '$http', function($route, $http) { return $http.post('/api/q', { id: $route.current.params.id, type: $route.current.params.type }); }] },
      controller: "ShowController",
      controllerAs: "ShowCtrl"
  });
  $routeProvider.when('/res/:q', {
      templateUrl: "/html/_result.html",
      // resolve: { Drives: ['$route', 'RestQ', function($route, RestQ) { return RestQ.get({ q: $route.current.params.q }); }] },
      resolve: { ApiType: ['ApiTypeFactory', function(f) { return f('search'); }], ApiSearchResult: ['$route', '$http', function($route, $http) { return $http.get('/api/q', { params: { q: $route.current.params.q } }); }] },
      controller: "ResultController",
      controllerAs: "ResultCtrl"
  });
  $routeProvider.when('/places', {
      templateUrl: "/html/_result.html",
      controller: "ResultController",
      controllerAs: "ResultCtrl",
      resolve: {
        ApiType: ['ApiTypeFactory', function(f) { return f('places'); }],
        ApiSearchResult: ['$http', function($http) { return $http.get('/api/places', { cache: false }); }],
        EnsureSatelliteJs: ['AsyncJsFactory', function(AsyncJsFactory) {
          return AsyncJsFactory('/js/lib/satellite.min.js', window.satellite);
        }]
      }
  });
  $routeProvider.when('/flights', {
      templateUrl: "/html/_flights.html",
      controller: "FlightController",
      controllerAs: "FlightCtrl"
  });
  $routeProvider.otherwise({
      redirectTo: "/"
  });

  $sceDelegateProvider.resourceUrlWhitelist([ 'self', '**']);

  L.Icon.Default.imagePath = "/css/images/";

  // GPSProvider.rootScopeVariable('position');
  // GPSProvider.intervalVariable(10000);


  // $provide.factory('403', ['$q', function($q) {
  //     return {
  //       'responseError': function(rejection) {
  //         console.log('responseError', rejection);
  //         if (rejection.status === 403) {
  //           console.log('not auth')
  //         }

  //         // // do something on error
  //         // if (canRecover(rejection)) {
  //         //   return responseOrNewPromise
  //         // }
  //         return $q.reject(rejection);
  //       }
  //     };
  //   }]);
  // $httpProvider.interceptors.push('403');



}]);

module.run(['$window', '$rootScope', '$templateCache', 'GlobalService', 'LocationService', 'GPS',
  function ( $window, $rootScope, $templateCache, GlobalService, LocationService, GPS ) {
  var location = $window.location,
      socket = io.connect('//' + location.hostname);
      // socket = io();

  $rootScope.$on('$destroy', function() {
    // LocationService.stop();
    GPS.stop();
  });

  GPS.reset();
  GPS.start();

  // LocationService.start();

  // socket.on('news', function (data) {
  // });

  socket.on('connect', function (data) {
    // console.log( 'connect', data);
    $rootScope.$evalAsync(function () {
      GlobalService.count = data ? data.count : 'n/a';
    });
  });
}]);

module.controller('FlightController', [
  function () {
  var _t = this;
}]);

module.controller('IndexController', ['History', 'LocationService', '$location', '$scope',
  function (History, LocationService, $location, $scope) {
  var _t = this;
  _t.history = History.data.facets.history.terms;
  _t.showInfo = false;
  

  _t.search = function (q) {
    $location.path('res/' +  encodeURIComponent(q.term));
  };

  _t.toggle = function () {
    _t.showInfo = !_t.showInfo;
  };

  // $scope.$watch(function () {return LocationService.coords; }, function (n) {
  //   if (!n.hasFix) return;
  //   console.log('latlon', n);
  // });
}]);

module.controller('MainController', ['$scope', '$rootScope', '$location', '$routeParams', '$window', 'UserService', 'GlobalService', 'RestDrive', 
  function ($scope, $rootScope, $location, $routeParams, $window, UserService, GlobalService, RestDrive) {
  var _t = this;
  _t.global = GlobalService;
  _t.me = UserService.me;
  // _t.me = { isAuth: true, id: 123, name: 'profile.displayName' };
  _t.form = { };
  _t.doFocus = true;

  _t.search = function () {
    if (!_t.form.q) return;
    $scope.searchForm.q.$setPristine();
    $location.path('/res/' + encodeURIComponent(_t.form.q));
  };

  _t.new = function () {
    $location.path('/new');
  };

  _t.newLogin = function () {
    var nw = $window.open('/api/auth/google', 'popupGoog', 'height=600,width=450');
    if ($window.focus) nw.focus();
    console.log('b');
  };

  // _t.suggest = [{dis: '1'}, {dis: '2'}, {dis: '3'}];
  // _t.suggestIdx = -1;
  // _t.suggestBackup = null;
  // _t.keyDown = function(evt) {
  //   console.log(evt.keyCode);
  //   var code = evt.keyCode;
  //   switch(code) {
  //     case 27: // esc
  //       _t.suggest = [];
  //       _t.suggestIdx = -1;
  //       if (!_t.suggestBackup) return;
  //       _t.form.q = _t.suggestBackup;
  //       _t.suggestBackup = null;
  //       break;

  //     case 40: // down
  //       if (_t.suggestIdx == _t.suggest.length-1) return;
  //       if (!_t.suggestBackup) _t.suggestBackup = _t.form.q;
  //       var item = _t.suggest[++_t.suggestIdx];
  //       //console.log('item', item);
  //       _t.form.q = item.dis;
  //       break;

  //     case 38: // up
  //       if (_t.suggestIdx == -1) return;
  //       _t.suggestIdx--;
  //       if (_t.suggestIdx == -1) {
  //         _t.form.q = _t.suggestBackup;
  //         _t.suggestBackup = null;
  //       }
  //       break;

  //     case 13: // enter
  //       if (_t.suggestIdx == -1 ) return;
  //       console.log('do');
  //       evt.preventDefault();
  //       break;
  //   }
  // }


  $rootScope.$on('$routeChangeStart', function () {
    // ngProgress.start();
  });
  $rootScope.$on('$routeChangeSuccess', function (scope, route) {
    _t.form.q = route.params.q;
    // ngProgress.complete();
  });
  $rootScope.$on('$routeChangeError', function () {
    // ngProgress.complete();
  });
}]);

module.controller('NewController', ['$scope', '$route', '$http', 'NewApiResult', 'Result', 'PlaceService', 'DelayerFactory', 'DocumentService', 'TypeService', 'GazService', 'GPS',
  function ( $scope, $route, $http, NewApiResult, Result, PlaceService, DelayerFactory, DocumentService, TypeService, GazService, GPS ) {
    var id,
        type,
        watcher;
    $scope.meta = {
      coords: GPS.coords
    };
    $scope.form = { };
    $scope.$watch('meta.type', function(val) {
      scopeType(TypeService.getType(val));
      if ( GPS.coords.hasFix && val === 'place' && !$scope.form.input ) {
        $scope.form.input = GPS.coords.lat.toFixed(4) + ',' + GPS.coords.lon.toFixed(4);
      }
    });

    $scope.submit = function() {
      var f = $scope.form;
      // console.log('$scope.form', f);
      var save = angular.extend(type.storeFn.call(f, $scope.meta), {
        id: id,
        type: type.name,
        tags: !f.tags ? [] : f.tags.split(','),
        onlyAuth: !!f.onlyAuth
      });

      // console.log('submit', save);
      DocumentService.store(save);
    };

    if (Result && Result.data) {
      var _d = Result.data;
      $scope.meta.type = _d.type;
      id = _d.id;
      TypeService.getType(_d.type).fetchFn.call($scope.form, _d.source);
      $scope.form.onlyAuth = _d.source.onlyAuth;
      $scope.form.tags = angular.isArray(_d.source.tags) ? _d.source.tags.join() : _d.source.tags;
    }

    function scopeType(obj) {
      if (!obj) return;
      type = obj;
      $scope.meta.type = obj.name;
      $scope.template = obj.template;
      $scope.preview = obj.preview;
      $scope.disable = false;
      if (angular.isFunction(obj.initFn)) {
        obj.initFn.call($scope.meta, $scope);
      }
    }

}]);

module.controller('PlacesController', ['ApiSearchResult',
  function (ApiSearchResult) {
    var t = this;
    t.places = ApiSearchResult.data.hits.hits;
    t.tags = ApiSearchResult.data.facets.tags.terms;
    setSelected(t.tags, true);

    t.doSearch = function() {
      console.log('t.search', t);
    };

    function setSelected (col, val) {
      angular.forEach(col, function (item) {
      item.selected = val;
    });
  }

}]);

module.controller('ResultController', ['ApiType', 'ApiSearchResult', 'RestXQ', 'DelayerFactory', '$scope', '$http', '$location', '$route', '$timeout',
  function (ApiType, ApiSearchResult, RestXQ, DelayerFactory, $scope, $http, $location, $route, $timeout) {
  var _t = this,
      facetSearch = DelayerFactory(500),
      first = true,
      starDelayer = DelayerFactory(100)
      ;


  _t.result = ApiSearchResult.data;

  _t.apiType = ApiType.type;
  var facetTerms = _t.result.facets.tags.terms;
  var facetTypes = _t.result.facets.types.terms;
  _t.idx = 0;
  setSelected(facetTypes, true);

  _t.facetTermsOperator = "or";

  // $scope.$watch(function () { return _t.facetTermsOperator; }, function (n) { console.log('now', n)  })

  // TODO: Consider moving to routeProvider
  // $http.put('/history', { q: $route.current.params.q });
  _t.show = function (hit) {
    // $location.path('/show/' + encodeURIComponent(id));
    $location.path('/show/' + encodeURIComponent(hit.type) + '/' + encodeURIComponent(hit.id));
  };

  _t.allTypes = function () {
    setSelected(facetTypes, true);
    doSearch();
  };
  _t.star = function (hit) {
    hit.source.star = !hit.source.star;
    starDelayer.run(function () {
      $http.post('/api/star', { id: hit.id, val: hit.source.star, type: hit.type });
    });
  };

  // $timeout(function () {
    _t.showHits = true;
  // }, 300);


  _t.facetClear = function () {
    setSelected(facetTerms, false);
    doSearch();
  };

  _t.facet = function (hit) {
    hit.selected = !hit.selected;
    doSearch();
  };

  $scope.$watch(function() { return _t.idx; }, function(n,o) {
    if (n == o) return;
    execute();
  });

  _t.mover = function(hit) {
    console.log('over');
  };

  _t.mleave = function(hit) {
    console.log('leave');
  };

  function execute() {
    $http.post(ApiType.uri, { q: $route.current.params.q, facets: { tags: { terms: getSelectedFacet(facetTerms), operator: _t.facetTermsOperator } }, types: getSelectedFacet(facetTypes), pager: { idx: _t.idx } }).success(function (data) {
      _t.result.hits = data.hits;
      filterFacet(facetTerms, data.facets.tags.terms);
    });
  }

  function doSearch () {
    facetSearch.run(execute);
  }

  function filterFacet (facetTerms, dataFacetTerms) {
    for (var i = facetTerms.length - 1; i >= 0; i--) {
      var val = facetTerms[i];
      val.disabled = true;

      for (var j = dataFacetTerms.length - 1; j >= 0; j--) {
         if (dataFacetTerms[j].term === val.term) {
          val.disabled = false;
          val.count = dataFacetTerms[j].count;
          break;
         }
      }
    }
  }

  function setSelected (col, val) {
    angular.forEach(col, function (item) {
      item.selected = val;
    });
  }

  function getSelectedFacet (facets) {
    var res = [];
    angular.forEach(facets, function (val) {
      if (val.selected) res.push(val.term);
    });
    return res;
  }
}]);


module.controller('ShowController', ['Result', '$http', '$location', function (Result, $http, $location) {
  this.Result = Result.data;

  this.edit = function(hit) {
    $location.path('/edit/' + encodeURIComponent(hit.type) + '/' + encodeURIComponent(hit.id));
     // console.log('edit', hit);
  };
}]);

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

module.directive('ngFocusBlurClass', [function () {
  return function(scope, element, attrs) {
    element.on('focus', function () {
      element.addClass(attrs.ngFocusBlurClass || 'ngFocus');
    })
    element.on('blur', function () {
      element.removeClass(attrs.ngFocusBlurClass || 'ngFocus');
    })
  };
}]);

module.directive('zIcons', [function() {
  return {
    scope: {
      zIcons: '='
    },
    template: '<dash-leaflet-markers icon="zIcons">' +
      '  <dash-leaflet-marker icon="cutlery"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="coffee"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="shopping-cart"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="eye"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="camera"></dash-leaflet-marker>' +
      '  <dash-leaflet-marker icon="home"></dash-leaflet-marker>' +
      '</dash-leaflet-markers>'
  };
}])
.directive('dashLeafletMarkers', ['$parse', 'PlaceService', function ($parse, PlaceService) {
  var _iconG, _iconS;
  return {
    restrict: 'E',
    template: '<div class="clearfix" ng-transclude></div>',
    replace: true,
    transclude: true,
    controller: ['$scope', function ($scope) {
      // console.log('done');
      this.setIcon = function (icon) {
        _iconS($scope, icon);
        // console.log(icon);
      };

    }],
    link: function(scope, element, attrs) {
      _iconG = $parse(attrs.icon);
      _iconS = _iconG.assign;

    }
  };
}])
.directive('dashLeafletMarker', ['$parse', 'PlaceService', function ($parse, PlaceService) {
  var parent;
  return {
    restrict: 'E',
    template: '<a href="javascript:;" ng-click="click()"><div class="awesome-marker-icon-{{color}} awesome-marker" style="position: relative; float: left"><i class="fa fa-{{icon}}" style="color: white"></i></div></a>',
    replace: true,
    scope: {

    },
    require: '?^dashLeafletMarkers',
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

      $scope.click = function (icon) {
        parent.setIcon($scope.icon);
      };
    }],
    link: function(scope, element, attrs, ctrl) {
      var poi = PlaceService.getPoi(attrs.icon);
      scope.icon = poi.name;
      scope.color = poi.color;
      parent = ctrl;
    }
  };
}]);
module.directive('ngSetFocus', [function () {
  return function (scope, element, attrs) {
    element[0].focus();
  };
}]);

// module.directive('dashAheadInput', [function () {
//   return function(scope, element, attrs) {
//     console.log('link');
//   };
// }]);

// module.directive('dashAhead', [function () {
//   return {
//     restrict: 'E',
//     link: function (scope, element, attrs, ctrl) {
//       console.log(arguments);
//     }
//   }
// }]);

module.directive('ngxToggleButton', [function () {
  return {
    restrict: 'E',
    template: '<button type="button" class="btn btn-info btn-sm" ng-click="click()">{{model}}</button>',
    replace: true,
    scope: {
      model: '='
    },
    controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
      var atl = $attrs.ngxToggleButtonLabels;
      var labels = angular.isDefined(atl) ? atl.split(',') : "yes,no".split(','),
          first = true;
      $scope.$watch(function () { return first; }, function (n) {
        $scope.model = first ? labels[0] : labels[1];
      });
      if (labels.length !== 2) throw Error("labels !== 2");
      $scope.click = function () {
        first = !first;
      };
    }]
  };
}]);

module.directive('zInputNew', [ 'TypeService', 'LocationService', 'DelayerFactory', '$http',
  function ( TypeService, LocationService, DelayerFactory, $http ) {
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

module.directive('zMap', ['$parse', '$location', 'PlaceService', function ($parse, $location, PlaceService) {
  return {
    restrict: 'A',
    // scope: {},
    // priority: 1000,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var t = this,
          map = L.map($element[0], { center: [0, 0], zoom: 12 }),
          base0 = L.tileLayer('https://{s}.tiles.mapbox.com/v3/ziaxdk.h6efc5a4/{z}/{x}/{y}.png', { attribution: '' }).addTo(map),
          base2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '' }),
          base3 = L.bingLayer("Alv2HutsIUPb_D2Jz0KdN37XixBdCph40lz8uMUNyUM2yp3IPg0oaiHn-J0ieMU4");
          chooser = L.control.layers({ 'Mapbox': base0, 'Basic': base2, 'Bing': base3 }, {}, { position: 'bottomleft' }).addTo(map);

      t.map = map;
      t.chooser = chooser;
      t.layers = { 'Mapbox': base0, 'Basic': base2, 'Bing': base3 }, {}, { position: 'bottomleft' };

      $scope.$on('$destroy', function() {
        map.remove();
      });

    }],
    link: function(scope, element, attrs) {
    }
  };
}]);

module.directive('zMapMarkersConnect', [function() {
  return {
    restrict: 'A',
    require: [ 'zMap' ],
    priority: 10,
    link: function(scope, elemment, attrs, zmap) {
      var map = zmap.map,
          lines;

      scope.$on('$destroy', function() {
        if (lines)
          map.removeLayer(lines);
      });

      attrs.$observe('zMapMarkers', function(m) {
        if (lines) {
          map.removeLayer(lines);
        }
        var ll = [];
        angular.forEach(angular.fromJson(m), function(d) {
          ll.push(d.source.location);
        });
        if (ll.length < 2) return;
        lines = L.polyline(ll, {color: 'red'}).addTo(map);
      });

      function reset() {

      }
    }
  };
}]);

module.directive('zMapTypes', ['$compile', '$rootScope', '$location', 'PlaceService',
  function ($compile, $rootScope, $location, PlaceService) {

  return {
    restrict: 'A',
    require: 'zMap',
    priority: 20,
    // scope: true,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    compile: function() {
      var nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            chooser = zmap.chooser,
            layerPlaces = L.featureGroup().addTo(map),
            layerFlights = L.featureGroup().addTo(map);
        
        // var layerFlights = L.layerGroup().addTo(map);

        attrs.$observe('zMapTypes', function(places) {
          // var hasData = false;
          layerPlaces.clearLayers();
          layerFlights.clearLayers();
          var _flights = [];
          angular.forEach(angular.fromJson(places), function(hit) {
            if (hit.type == 'place') {
              var place = hit.source,
                  poi = attrs.zMapMarkersIcon ? { type: attrs.zMapMarkersIcon, color: 'cadetblue' } : PlaceService.getPoiDefault(place.icon),
                  marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
                    .on('click', function() { scope.$evalAsync(function() { $location.path('/show/' + hit.type + '/' + encodeURIComponent(hit.id)); }); })
                    .on('mouseover', function() { marker.openPopup(); })
                    .on('mouseout', function() { marker.closePopup(); })
                    .bindPopup(hit.source.header, { closeButton: false })
                    .addTo(layerPlaces);
              hasData = true;
            }
            else if (hit.type == 'flight') {
              var _coords = [];
              angular.forEach(hit.source.airports, function(a) {
                _coords.push(L.latLng(a.location));
                var marker = L.marker(a.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-plane', markerColor: 'cadetblue', prefix: 'fa' }) })
                  .on('mouseover', function() { marker.openPopup(); })
                  .on('mouseout', function() { marker.closePopup(); })
                  .bindPopup(a.name, { closeButton: false })
                  .addTo(layerFlights);


              });
              _flights.push(_coords);
            }
          });
          if (_flights.length !== 0) {
            L.multiPolyline(_flights).addTo(layerFlights);
          }
          if (hasData)
            map.fitBounds(layerPlaces.getBounds());
        });

        chooser.addOverlay(layerPlaces, 'Places');
        chooser.addOverlay(layerFlights, 'Flights');

        scope.$on('$destroy', function() {
          chooser.removeLayer(layerPlaces);
          map.removeLayer(layerPlaces);
          chooser.removeLayer(layerFlights);
          map.removeLayer(layerFlights);
          nScope.$destroy();
        });
      };
    }
  };
}]);
module.directive('zMapMarkers', ['$compile', '$rootScope', '$location', 'PlaceService',
  function ($compile, $rootScope, $location, PlaceService) {

  return {
    restrict: 'A',
    require: 'zMap',
    priority: 20,
    // scope: true,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    compile: function() {
      var nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            chooser = zmap.chooser,
            layers = L.featureGroup().addTo(map);

        attrs.$observe('zMapMarkers', function(places) {
          var hasData = false;
          layers.clearLayers();
          angular.forEach(angular.fromJson(places), function(hit) {
            var place = hit.source,
                poi = attrs.zMapMarkersIcon ? { type: attrs.zMapMarkersIcon, color: 'cadetblue' } : PlaceService.getPoiDefault(place.icon),
                marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
                  .on('click', function() { scope.$evalAsync(function() { $location.path('/show/' + hit.type + '/' + encodeURIComponent(hit.id)); }); })
                  .on('mouseover', function() { marker.openPopup(); })
                  .on('mouseout', function() { marker.closePopup(); })
                  .bindPopup(hit.source.header, { closeButton: false })
                  .addTo(layers);
            hasData = true;

          });
          if (hasData)
            map.fitBounds(layers.getBounds());
        });

        chooser.addOverlay(layers, 'Places');

        scope.$on('$destroy', function() {
          chooser.removeLayer(layers);
          map.removeLayer(layers);
          nScope.$destroy();
        });
      };
    }
  };
}]);

module.directive('zMapSizer', ['$compile', '$parse', '$rootScope', 'LeafletControlsService',
  function ($compile, $parse, $rootScope, LeafletControlsService) {

  return {
    restrict: 'A',
    require: 'zMap',
    // priority: 2,
    // scope: true,
    compile: function() {
      var html = $compile('<div class="leaflet-control-layers z-map-sizer">' +
        '<div class="btn-group" ng-class="groupSize">' +
        '<button ng-repeat="b in buttons" type="button" class="btn" ng-class="{\'btn-primary\': b.key == sizeAct, \'btn-default\': b.key != sizeAct}" ng-click="setSize(b.key)">{{b.val}}</button>' +
        '</div>' +
      '</div>'),
          nScope = $rootScope.$new();
      nScope.buttons = [{key: 's', val: 'Small'}, {key: 'm', val: 'Medium'}, {key: 'l', val: 'Large'}];

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            bigG = $parse(attrs.zMapSizer),
            bigS = bigG.assign,
            control = LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-sizer'});

        nScope.setSize = function(size) {
          // console.log('setSize', size);
          nScope.sizeAct = size;
          bigS(scope, size);
        };

        var s = bigG(scope);
        if (s) nScope.sizeAct = s;

        nScope.groupSize = 'btn-group-sm';
        if (attrs.zMapSizerSize) nScope.groupSize = 'btn-group-' + attrs.zMapSizerSize;
        map.addControl(control);

        scope.$on('$destroy', function() {
          nScope.$destroy();
          map.removeControl(control);
        });
      };
    }
  };
}]);

module.directive('zMapMarker', ['$compile', '$parse', '$rootScope', 'PlaceService', 'LeafletControlsService',
  function ($compile, $parse, $rootScope, PlaceService, LeafletControlsService) {

  return {
    restrict: 'A',
    require: 'zMap',
    priority: 2,
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          markerG = $parse(attrs.zMapMarker),
          markerS = markerG.assign,
          pos = [0 ,0],
          layer = L.featureGroup().addTo(map),
          marker = L.marker(pos, {
            draggable: true,
            icon: L.AwesomeMarkers.icon({ icon: 'fa-spinner', markerColor: 'darkpurple', prefix: 'fa' }) })
          .on('drag', function(e) {
            click(e.target);
          })
          .addTo(layer);

      scope.$watch(function() { return markerG(scope); }, function(val) {
        if (!val || !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(val)) return;
        var pos = val.split(',');
        if (!angular.isArray(pos) || pos.length !== 2) return;
        marker.setLatLng(pos);
        map.panTo(pos);
      });

      function click(e) {
        var ll = e.latlng||e.getLatLng();
        marker.setLatLng(ll);
        scope.$evalAsync(function () {
          markerS(scope, ll.lat.toFixed(4) + ',' + ll.lng.toFixed(4));
        });
      }

      map.on('click', click);
      map.setView(pos);

      attrs.$observe('zMapMarkerIcon', function (val) {
        if (!val) return;
        var poi = PlaceService.getPoi(val);
        marker.setIcon(L.AwesomeMarkers.icon({ icon: 'fa-' + poi.name, markerColor: poi.color, prefix: 'fa' }));
      });
      scope.$on('$destroy', function() {
        map.off('click', click);
        map.removeLayer(layer);
      });
    }
  };
}]);
module.directive('zMapTagsControl', ['$compile', '$rootScope', 'LeafletControlsService',
  function ($compile, $rootScope, LeafletControlsService) {
  
  return {
    restrict: 'A',
    require: 'zMap',
    compile: function() {
      var _t = '<div class="leaflet-control-layers z-map-tags-control">' +
        '<a href="javascript:;" ng-click="flip()" ng-hide="show" style="width: 20px; display: block; text-align: center">' +
          '<i class="fa fa-tags"></i>' +
        '</a>' +
        '<div class="list-group" ng-show="show">' +
          '<a ng-class="{active: tag.selected}" href="javascript:;" ng-click="facet(tag)" ng-repeat="tag in tags track by tag.term" class="list-group-item">' +
            '<span class="badge">{{tag.count}}</span>{{tag.term}}' +
          '</a>' +
          '<a href="javascript:;" class="list-group-item" ng-click="flip()" style="text-align: center">' +
            '<span><i class="fa fa-tags"></i></span>' +
          '</a>' +
        '</div>' +
      '</div>',
          html = $compile(_t);

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            _scope = scope.$new(),
            ctrl = LeafletControlsService.leafletControl({html: html, scope: _scope, className: 'z-map-tags-select', position: 'bottomright'});
        map.addControl(ctrl);

        _scope.flip = function() {
          _scope.show = !_scope.show;
        };

        _scope.tags = [];
        _scope.show = false;

        _scope.facet = function(hit) {
          _scope.$eval(attrs.zMapTagsControlCb, { hit: hit });
        };

        _scope.$watch(function () { return _scope.$eval(attrs.zMapTagsControl); }, function (value) {
          _scope.tags = value;
        });

        scope.$on('$destroy', function() {
          map.removeControl(ctrl);
          _scope.$destroy();
        });
      };
    }
  };
}]);
module.directive('zMapChooser', ['$compile', 'LeafletControlsService',
  function ($compile, LeafletControlsService) {
  return {
    restrict: 'A',
    require: 'zMap',
    compile: function() {
      var _t = '<div class="leaflet-control-layers z-map-chooser">' +
        '<a href="javascript:;" ng-click="flip()" ng-hide="show" style="width: 20px; display: block; text-align: center">' +
          '<i class="fa fa-globe"></i>' +
        '</a>' +
        '<div class="list-group" ng-show="show">123' +
        '</div>' +
      '</div>',
          html = $compile(_t);

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            _scope = scope.$new(),
            ctrl = LeafletControlsService.leafletControl({html: html, scope: _scope, className: 'z-map-chooser', position: 'bottomleft'});

        map.addControl(ctrl);
        _scope.flip = function() {
          _scope.show = !_scope.show;
        };
        _scope.show = false;

        console.log(zmap.layers);

        scope.$on('$destroy', function() {
          map.removeControl(ctrl);
          _scope.$destroy();
        });
      };
    }
  };
}]);
module.directive('zMapPanTo', [function () {
  
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map;
      attrs.$observe('zMapPanTo', function(v) {
        if (!v) return;
        var ll = angular.fromJson(v);
        map.panTo(ll);
      });
    }
  };
}]);

module.directive('zMapIss2', ['$http', '$timeout', function ($http, $timeout) {
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup(),
          path = null,
          iss = L.marker([0, 0]).addTo(layer),
          uri = 'http://api.open-notify.org/iss-now.json?callback=JSON_CALLBACK',
          run = null,
          cancel = true;

      function grab() {
        if (cancel) return;
        $http.jsonp(uri).success(function(data) {
          add(data.iss_position);
          if (cancel) return;
          run = $timeout(grab, 1000);
        });
      }

      function add(ll) {
        // console.log('open', ll.latitude, ll.longitude);
        var pos = L.latLng(ll.latitude, ll.longitude);
        iss.setLatLng(pos);
        if (!path) {
          path = L.polyline([pos], { color: 'red', noClip: true }).addTo(layer);
        } else {
          path.addLatLng(pos);
        }
      }

      function enable(e) {
        if (e && e.layer == layer) {
          cancel = false;
          grab();
        }
      }
      function disable(e) {
        if (e && e.layer == layer) {
          cancel = true;
        }
      }
      chooser.addOverlay(layer, 'ISS (old)???');
      map.on('overlayadd', enable);
      map.on('overlayremove', disable);
      scope.$on('$destroy', function() {
        disable();
        map.off('overlayadd', enable);
        map.off('overlayremove', disable);
        chooser.removeLayer(layer);
        map.removeLayer(layer);
      });
      // grab();
    }
  };
}]);
module.directive('zMapIss', ['$http', '$timeout', '$interval', '$parse', function ($http, $timeout, $interval, $parse) {
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      if (!window.satellite) return;
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup().addTo(map),
          path = null,
          run = null,
          iss = L.marker([0, 0]).addTo(layer),
          tle_line_1 = "1 25544U 98067A   14050.52955885  .00016717  00000-0  10270-3 0  9004",
          tle_line_2 = "2 25544  51.6500 322.8568 0003647 155.3472 204.7854 15.50497588 33075";

      $http.get('/api/iss').then(startCalc, angular.noop);

      function startCalc(data) {
        if (data) {
          tle_line_1 = data.data.tle[0];
          tle_line_2 = data.data.tle[1];
        }
        run = $interval(calc, 1000);
        calc();
      }

      // 20-02-2014
      // Lib: https://github.com/shashwatak/satellite-js
      function calc() {
        var satrec = satellite.twoline2satrec (tle_line_1, tle_line_2);
        var date = new Date();
        var position_and_velocity = satellite.propagate (satrec, date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        var position_eci = position_and_velocity["position"];
        // var velocity_eci = position_and_velocity["velocity"];
        var gmst = satellite.gstime_from_date (date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        var position_gd    = satellite.eci_to_geodetic (position_eci, gmst);
        var longitude = position_gd["longitude"];
        var latitude  = position_gd["latitude"];
        var longitude_str = satellite.degrees_long (longitude);
        var latitude_str  = satellite.degrees_lat  (latitude);
        var pos = L.latLng(latitude_str, longitude_str);
        iss.setLatLng(pos);
        if (!path) {
          path = L.polyline([pos], { color: 'red', noClip: true }).addTo(layer);
        } else {
          path.addLatLng(pos);
        }
      }

      chooser.addOverlay(layer, 'ISS???');
      scope.$on('$destroy', function() {
        chooser.removeLayer(layer);
        map.removeLayer(layer);
        $interval.cancel(run);
      });
    }
  };
}]);
module.directive('zMapFlights', ['$parse',
  function ($parse) {
  
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup().addTo(map),
          markers = L.featureGroup().addTo(layer),
          path = L.polyline([], { color: 'blue' }).addTo(layer);

      // attrs.$observe('zMapFlights', function(v) {
      //   v = $parse(v)(scope);
      //   if (!v || !angular.isArray(v)) return;
      //   markers.clearLayers();
      //   path.setLatLngs([]);
      //   angular.forEach(v, function(p) {
      //     var ll = L.latLng([p.location[1], p.location[0]]);
      //     L.marker(ll).addTo(markers);
      //     path.addLatLng(ll);
      //   });
      //   if (v.length > 1)
      //     map.fitBounds(layer.getBounds());
      // });
      chooser.addOverlay(layer, 'Flights');
      scope.$on('$destroy', function() {
        chooser.removeLayer(layer);
        map.removeLayer(layer);
      });
    }
  };
}]);

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

module.directive('zPopoverIframe', ['$parse', '$document', '$compile', '$timeout', function ($parse, $document, $compile, $timeout) {
  return {
    restrict: 'A',
    replace: false,
    scope: true,
    compile: function() {
      var tmpl = $compile('<div class="popover" style="display: block; position: absolute; top: 60px; bottom: 40px; left: 10px; right: 10px; max-width: none">' +
        '<div class="popover-content" style="height: 100%">' +
          '<iframe ng-src="{{url}}" style="width: 100%; height: 100%"></iframe>' +
        '</div>' +
      '</div>');

      return function link ( scope, element, attrs ) {
        var popup, timeout;

        var url = $parse(attrs.zPopoverIframe)(scope)
          , delay = $parse(attrs.zPopoverIframeDelay)(scope);

        element.on('mouseenter', function () {
          if (timeout) $timeout.cancel(timeout);
          timeout = $timeout(function () {
            timeout = null;
            if (popup) popup.remove();
            popup = tmpl(scope, function () {});
            popup.on('mouseleave', function() {
              popup.remove();
              popup = null;
            });
            $document.find( 'body' ).append( popup );
            scope.url = url;
          }, delay || 1000);
        });

        element.on('mouseleave', function() {
          if (timeout) {
            $timeout.cancel(timeout);
          }
        });
      };
    }
  };
}]);

module.directive('zSelect2', [function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    template: '<input type="hidden" class="form-control" placeholder="Enter tags..." />',
    replace: true,
    link: function(scope, element, attrs, ngModel) {
      scope.$watch(attrs.zSelect2, function(val) {
        var temp = [];
        angular.forEach(val, function(e) {
          temp.push(e.term);
        });
        element.select2({
          tags: temp,
          multiple: true
        }).on('change', function(evt) {
          ngModel.$setViewValue(evt.val);
        });
      });

      ngModel.$render = function() {
        element.val(ngModel.$viewValue);
      };

      scope.$on('$destroy', function() {
        element.select2('destroy');
      });
    }
  };
}]);

// module.directive('zSuggest', ['$parse', function ($parse) {
//   return {
//     restrict: 'A',
//     scope: { zSuggest: '=' },
//     template: 
//     '<div class="z-suggest" ng-show="data.length != 0">' +
//       '<ul>' +
//         '<li ng-repeat="d in data" ng-class="{selected: $index == index}">{{d.dis}}</li>' +
//       '</ul>' +
//     '</div>',
//     controller: ['$scope', '$element', '$attrs', function(scope, element, attrs) {
//         scope.data = [];
//         scope.index = -1;
//         scope.$watch('zSuggest', function(n) {
//           if (!n) return;
//           scope.data.push({dis:n});
//           console.log('val', n);
//         });

//         function reset() {
//           scope.index = -1;
//           scope.data = [];
//         }
//         function down() {
//           if (scope.data.length - 1 == scope.index) return;
//           ++scope.index;
//         }
//         function up() {
//           if (scope.index == -1) return;
//           --scope.index;
//         }
  
//         angular.element(element).parent().find('input').on('keydown', function(evt) {
//           var code = evt.keyCode;
//           console.log('code', code);
//           switch(code) {
//             case 40: // down
//               down();
//               break;
  
//             case 38: // up
//               up();
//               break;

//             case 27: // esc
//               reset();
//               break;

//             default:
//               break;
//           }
//           scope.$apply();
//         });
//       }
//     ]};
// }]);

// // module.directive('zuggest', ['$compile', function ($compile) {
// //   return {
// //     restrict: 'E',
// //     link: function(scope, element, attrs) {
// //       console.log('link');
// //     }
    
// //   }
// // }]);

// // module.directive('zuggest', ['$compile', function ($compile) {
// //   return {
// //     restrict: 'E',
// //     scope: { },
// //     transclude: true,
// //     replace: true,
// //     template: '<div><div ng-transclude></div><div>*</div></div>',
// //     link: function(scope, element, attrs) {
// //       console.log('link');
// //     }
// //     // compile: function(tElement) {
// //     //   var html = $compile('<div class="z-suggest">' +
// //     //     '<ul>' +
// //     //     '<li ng-repeat="d in data" ng-class="{selected: $index==index}">{{d.d}}</li>' +
// //     //     '</ul>' +
// //     //     '</div>');

// //     //   return function link(scope, element, attrs) {
// //     //     tElement.after(html(scope));


// //     //     var data = [{d: '1'}, {d: '2'}, {d: '3'}, {d: '4'}];

// //     //     scope.data = data;
// //     //     scope.index = -1;

// //     //     tElement.on('keyup', function(evt) {
// //     //       var code =  evt.keyCode;
// //     //       console.log(code);
// //     //       switch(code) {
// //     //         case 40: // down
// //     //           console.log('down');
// //     //           scope.index++;
// //     //           break;
// //     //         case 38: // up
// //     //           if (scope.index == -1) return;
// //     //           scope.index--;
// //     //           break;
// //     //       }
// //     //     });
// //     //   };
// //     // }
// //   };
// // }]);

// module.directive('zRegEx', [function(){
//   // Runs during compile
//   return {
//     // name: '',
//     // priority: 1,
//     // terminal: true,
//     // scope: {}, // {} = isolate, true = child, false/undefined = no change
//     // controller: function($scope, $element, $attrs, $transclude) {},
//     require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
//     // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
//     // template: '',
//     // templateUrl: '',
//     // replace: true,
//     // transclude: true,
//     // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
//     link: function(scope, iElm, iAttrs, ngModel) {
//       console.log('lini', iAttrs.zRegEx);
      
//     }
//   };
// }]);
module.factory('ApiTypeFactory', [function () {
  var apiType = function (type) {
    if (type === 'places') return {
      uri: '/api/places',
      type: 'places'
    };

    return {
      uri: '/api/xq',
      type: 'search'
    };
  };
  return apiType;
}]);

module.factory('AsyncJsFactory', [ '$q', '$timeout',  function ( $q, $timeout ) {
  // var delayer = function (delayInMs) {
  //   var canceler;
  //   return {
  //     run: function (actionToExecute) {
  //       if (canceler) $timeout.cancel(canceler);
  //       canceler = $timeout(actionToExecute, delayInMs);
  //     }
  //   };
  // };
  // return delayer;
  // 
  
  var ctor = function(url, isLoaded) {
    var deferred = $q.defer(),
        script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0];

    if (isLoaded) {
      deferred.resolve(true);
      return;
    }

    script.src = url;
    script.onerror = function() { deferred.resolve(false); };
    script.onload = script.onreadystatechange = function() {
      // var rs = this.readyState;
      // if (rs && rs != 'complete' && rs != 'loaded') {
      //   deferred.resolve(false);
      //   return;
      // }
      deferred.resolve(true);
    };
    head.appendChild(script);

    return deferred.promise;
  };
  return ctor;
}]);

module.factory('DelayerFactory', ['$timeout', function ($timeout) {
  var delayer = function (delayInMs) {
    var canceler;
    return {
      run: function (actionToExecute) {
        if (canceler) $timeout.cancel(canceler);
        canceler = $timeout(actionToExecute, delayInMs);
      },
      cancel: function() {
        if (!canceler) return;
        $timeout.cancel(canceler);
        canceler = undefined;
      }
    };
  };
  return delayer;
}]);

module.factory('RestDrive', ['$resource', function ($resource) {
  return $resource('api/drive', {}, { 'query':  { method:'GET', isArray: false }});
}]);
module.factory('RestQ', ['$resource', function ($resource) {
  return $resource('api/q');
}]);
module.factory('RestXQ', ['$resource', function ($resource) {
  return $resource('api/xq');
}]);
module.factory('RestClick', ['$resource', function ($resource) {
  return $resource('api/click/:id', {id: '@id'});
}]);

module.filter('html', ['$sce', function ($sce) {
  return function (val, len, moreChars) {
    if (!val) return "";
    len = !angular.isNumber(len) ? 10 : len
    moreChars = !angular.isDefined(moreChars) ? '...' : moreChars;
    val = val.toString().replace(/<[^>]*>/g, '');
    if (val.length <= len) return val;
    return val.substring(0, len) + moreChars;
  };
}]);

module.filter('textile', ['$sce', function ($sce) {
  return function (val) {
    return !val ? "" : $sce.trustAsHtml(textile.parse(val));
  };
}]);

module.service('AirportService', ['$http', function ($http) {
  function get(code) {
    return $http.get('/api/airport', { params: { code: code } });
  }

  return {
    get: get,
    
  };
}]);

module.service('DocumentService', ['$http', 'MessageService', function ($http, MessageService) {
  function save(document) {
    return $http.post('/api/document', document);
  }
  function update(document) {
    return $http.put('/api/document', document);
  }
  function store(document) {
    return $http.post('/api/document2', document).then(
      function() { MessageService.ok('Ok'); },
      function(err) { MessageService.err(err.status, err.data); }
    );
  }

  return {
    save: save,
    update: update,
    store: store
  };
}]);

module.service('GazService', ['$http', 'MessageService', function ($http, MessageService) {
  this.stationsNear = function(coords) {
    return $http.post('/api/stations_near', coords);
  };

  this.vehicles = function() {
    return $http.post('/api/vehicle/list');
  };
}]);

module.service('GlobalService', ['$http', function ($http) {


  return {
    count: 0,
    types: []
  };
}]);

module.service('LeafletControlsService', [function () {
  var LeafletControlClass = L.Control.extend({
    options: {
      position: 'topright'
    },
    
    initialize: function (options) {
      L.Util.setOptions(this, options);
      this._elements = options.html(options.scope);
    },

    onAdd: function() {
      this._initLayout();
      return this._container;
    },

    _initLayout: function () {
      var container = this._container = L.DomUtil.create('div', this.options.className);
      angular.element(container).append(this._elements);
      return container;
    }
  });

  return {
    leafletControl: function(options) {
      return new LeafletControlClass(options);
    }
  };
}]);

module.service('LocationService', ['$window', '$rootScope', function ($window, $rootScope) {
	var watchId,
      coords = {
        hasFix: false,
        lat: 0,
        lon: 0
      };
	
  function whenLocated (position) {
    var c = position.coords;
    // console.log(c);
    $rootScope.$apply(function () {
      coords.hasFix = true;
      coords.lat = c.latitude;
      coords.lon = c.longitude;
    });
	}

  function start() {
    if (watchId) return;
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(whenLocated);
      watchId = navigator.geolocation.watchPosition(whenLocated);
    }
    else {
      console.log('location not supported');
    }
  }

  function stop() {
    if (!watchId) return;
    navigator.geolocation.clearWatch(watchId);
    watchId = undefined;
  }



	return {
		coords: coords,
    start: start,
    stop: stop
	};
}]);

module.service('MessageService', ['$rootScope', function ($rootScope) {
  function emit(type, num, msg) {
    $rootScope.$emit(type, { num: num, msg: msg });
  }

  function err(num, msg) {
    emit('err', num, msg);
  }

  function ok(msg) {
    emit('ok', 0, msg);
  }

  return {
    err: err,
    ok: ok
  };
}]);

module.service('PlaceService', [function () {
  function each(cb) {
    var len = poi.length;
    while (len--) {
      if (cb(poi[len])) return poi[len];
    }
  }

  var poi = [
      { name: 'cutlery', type: 'cutlery', color: 'cadetblue', title: 'Restaurant' },
      { name: 'coffee', type: 'coffee', color: 'darkred', title: 'Coffee' },
      { name: 'shopping-cart', type: 'shopping-cart', color: 'darkgreen', title: 'Shopping' },
      { name: 'eye', type: 'eye', color: 'blue', title: 'Viewpoint' },
      { name: 'camera', type: 'camera', color: 'orange', title: 'Photography' },
      { name: 'tint', type: 'tint', color: 'red', title: 'Droplet' },
      { name: 'home', type: 'home', color: 'red', title: 'Hotel' }
    ],
  getPoi = function (name) {
    return each(function (poi) { return poi.name === name; });
  };
  function getPoiDefault(name) {
    var _poi = getPoi(name);
    return _poi||poi[0];
  }


  return {
    poi: poi,
    getPoi: getPoi,
    getPoiDefault: getPoiDefault

  };
}]);

module.service('TypeService', [ 'GPS', 'PlaceService', 'GazService', '$filter',
  function ( GPS, PlaceService, GazService, $filter ) {
  var _types = [
    {
      parser: /undefined/,
      name: undefined
    },
    {
      name: 'flight',
      template: 'html/_new_flight.html',
      preview: true,
      initFn: function(scope) {
        this.airports = [];
        this.mapsize = 'm';
        this.goto = undefined;
      },
      storeFn: function(meta) {
        var _airports = [];
        angular.forEach(meta.airports, function(a) {
          _airports.push({ airport_icao: a.id, airport_iata: a.source.airport_iata, name: a.source.header, location: a.source.location });
        });
        return {
          header: this.input,
          content: this.content,
          date: this.date,
          airports: _airports
        };
      },
      fetchFn: function(data) {
        
      }
    },
    {
      name: 'gaz',
      template: 'html/_new_gaz.html',
      preview: false,
      initFn: function(scope) {
        var _t = this;
        scope.form.purchaseDate = $filter("date")(Date.now(), 'yyyy-MM-dd');
        scope.disable = true;
        GazService.vehicles().then(function(resp) { _t.vehicles = resp.data.hits.hits; scope.form.vehicle = _t.vehicles[0].id; });
      },
      storeFn: function(meta) {
        console.log(this);
        var location = GPS.coords.hasFix ? { lat: GPS.coords.lat, lon: GPS.coords.lon } : { lat: 0, lon: 0 };
        return {
          vehicle: this.vehicle,
          purchaseDateUtc: new Date(this.purchaseDate),
          odometer: this.odometer,
          units: this.units,
          price: this.price,
          station: this.station,
          location: location
        };
      },
      fetchFn: function(data) {
        
      }
    },
    {
      parser: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
      name: 'place',
      template: 'html/_new_place.html',
      preview: true,
      initFn: function() {
        // if (angular.isObject(this.place)) return;
        // console.log('called');
        this.place = {
          mapsize: 'm',
          mapicon: PlaceService.getPoiDefault().type
        };
      },
      storeFn: function(meta) {
        var loc = this.input.split(',');
        return {
          header: this.header,
          content: this.content,
          location: { lat: loc[0].trim(), lon: loc[1].trim() },
          icon: PlaceService.getPoi(meta.place.mapicon).type
        };
      },
      fetchFn: function(data) {
        this.input = data.location.lat + ',' + data.location.lon;
        this.header = data.header;
        this.content = data.content;
      }
    },
    {
      parser: /^https?\:\/\//,
      name: 'link',
      template: 'html/_new_link.html',
      preview: true,
      initFn: angular.noop,
      storeFn: function() {
        return {
          url: this.input,
          header: this.header,
          content: this.content
        };
      },
      fetchFn: function(data) {
        this.input = data.url;
        this.header = data.header;
        this.content = data.content;
      }
    },
    {
      name: 'article',
      template: 'html/_new_article.html',
      preview: true,
      initFn: angular.noop,
      storeFn: function() {
        return {
          header: this.input,
          content: this.content
        };
      },
      fetchFn: function(data) {
        this.input = data.header;
        this.content = data.content;
      }
    }

    // {
    //   name: '_name_',
    //   template: 'html/_new_(name).html',
    //   preview: true,
    //   storeFn: function() {
    //   },
    //   fetchFn: function(data) {
        
    //   }
    // }
  ];

  function types() {
    var _res = [];
    for (var i = _types.length - 1; i >= 0; i--) {
      var _t = _types[i].name;
      if (_t) _res.push(_t);
    }
    return _res;
  }

  function getType (name) {
    for (var i = _types.length - 1; i >= 0; i--) {
      if (_types[i].name === name) return _types[i];
    }
  }
  return {
    getType: getType,
    types: types
  };
}]);

module.service('UserService', ['$http', function ($http) {
  var me = { isAuth: false };
  $http.get('/api/me').success(function (data) {
    angular.extend(me, data, { isAuth: true });
  });
  return {
    me: me
  };
}]);
}());