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

// Config - with Angular route module
// module.config(['$routeProvider', '$sceDelegateProvider', '$provide', '$httpProvider', 'GPSProvider', function ($routeProvider, $sceDelegateProvider, $provide, $httpProvider, GPSProvider) {
//   $routeProvider.when('/', {
//       templateUrl: "/html/_index.html",
//       resolve: { History: ['$http', function($http) { return $http.get('/api/history'); }] },
//       controller: "IndexController",
//       controllerAs: "IndexCtrl"
//   });
//   $routeProvider.when('/new', {
//       templateUrl: "/html/_new.html",
//       resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
//       controller: "NewController",
//       controllerAs: "NewCtrl"
//   });
//   $routeProvider.when('/edit/:type/:id', {
//       templateUrl: "/html/_new.html",
//       resolve: {// TODO: Create mulitple GET
//         Result: ['$route', '$http', function($route, $http) { return $http.post('/api/q', { id: $route.current.params.id, type: $route.current.params.type }); }],
//         NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }]
//       },
//       controller: "NewController",
//       controllerAs: "NewCtrl"
//   });
//   $routeProvider.when('/show/:type/:id', {
//       templateUrl: "/html/_show.html",
//       // resolve: { Drive: ['$route', 'RestQ', function($route, RestQ) { return RestQ.save({ id: $route.current.params.id, type: $route.current.params.type }); }] },
//       resolve: { Result: ['$route', '$http', function($route, $http) { return $http.post('/api/q', { id: $route.current.params.id, type: $route.current.params.type }); }] },
//       controller: "ShowController",
//       controllerAs: "ShowCtrl"
//   });
//   $routeProvider.when('/res/:q', {
//       templateUrl: "/html/_result.html",
//       // resolve: { Drives: ['$route', 'RestQ', function($route, RestQ) { return RestQ.get({ q: $route.current.params.q }); }] },
//       resolve: { ApiType: ['ApiTypeFactory', function(f) { return f('search'); }], ApiSearchResult: ['$route', '$http', function($route, $http) { return $http.get('/api/q', { params: { q: $route.current.params.q } }); }] },
//       controller: "ResultController",
//       controllerAs: "ResultCtrl"
//   });
//   $routeProvider.when('/places', {
//       templateUrl: "/html/_result.html",
//       controller: "ResultController",
//       controllerAs: "ResultCtrl",
//       resolve: {
//         ApiType: ['ApiTypeFactory', function(f) { return f('places'); }],
//         ApiSearchResult: ['$http', function($http) { return $http.get('/api/places', { cache: false }); }],
//         EnsureSatelliteJs: ['AsyncJsFactory', function(AsyncJsFactory) {
//           return AsyncJsFactory('/js/lib/satellite.min.js', window.satellite);
//         }]
//       }
//   });
//   $routeProvider.when('/flights', {
//       templateUrl: "/html/_flights.html",
//       controller: "FlightController",
//       controllerAs: "FlightCtrl"
//   });
//   $routeProvider.otherwise({
//       redirectTo: "/"
//   });

//   $sceDelegateProvider.resourceUrlWhitelist([ 'self', '**']);

//   L.Icon.Default.imagePath = "/css/images/";

//   // GPSProvider.rootScopeVariable('position');
//   // GPSProvider.intervalVariable(10000);


//   // $provide.factory('403', ['$q', function($q) {
//   //     return {
//   //       'responseError': function(rejection) {
//   //         console.log('responseError', rejection);
//   //         if (rejection.status === 403) {
//   //           console.log('not auth')
//   //         }

//   //         // // do something on error
//   //         // if (canRecover(rejection)) {
//   //         //   return responseOrNewPromise
//   //         // }
//   //         return $q.reject(rejection);
//   //       }
//   //     };
//   //   }]);
//   // $httpProvider.interceptors.push('403');



// }]);


module.config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', '$provide', '$httpProvider', 'GPSProvider',
  function ($stateProvider, $urlRouterProvider, $sceDelegateProvider, $provide, $httpProvider, GPSProvider) {


  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: "/html/_index.html",
      resolve: { History: ['$http', function($http) { return $http.get('/api/history'); }] },
      controller: "IndexController",
      controllerAs: "IndexCtrl"
    })
    .state('advsearch', {
      url: '/search',
      templateUrl: "/html/_search.html",
      resolve: { Tags: ['$http', function($http) { return $http.get('/api/tags'); }] },
      // resolve: { History: ['$http', function($http) { return $http.get('/api/history'); }] },
      controller: "SearchController",
      controllerAs: "SearchCtrl"
    })
    .state('new', {
      url: '/new',
      templateUrl: "/html/_new.html",
      resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: 'NewController',
      controllerAs: 'NewCtrl'
    })
/*    .state('new.article', {
      url: '/article',
      templateUrl: "/html/_new_article.html",
      // resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: 'NewArticleController',
      controllerAs: 'NewArticleCtrl',
      data: {
        type: 'article'
      }
    })
    .state('new.link', {
      url: '/link',
      templateUrl: "/html/_new_link.html",
      // resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: 'NewLinkController',
      controllerAs: 'NewLinkCtrl'
    })
    .state('new.place', {
      url: '/place',
      templateUrl: "/html/_new_place.html",
      // resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: 'NewPlaceController',
      controllerAs: 'NewPlaceCtrl'
    })
    .state('new.gaz', {
      url: '/gaz',
      templateUrl: "/html/_new_gaz.html",
      // resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: 'NewGazController',
      controllerAs: 'NewGazCtrl'
    })
    .state('new.flight', {
      url: '/flight',
      templateUrl: "/html/_new_flight.html",
      // resolve: { Result: angular.noop, NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
      controller: 'NewFlightController',
      controllerAs: 'NewFlightCtrl'
    })*/
    .state('searchresult', {
      url: '/res/:q',
      templateUrl: "/html/_result.html",
      resolve: {
        ApiType: ['ApiTypeFactory', function(f) { return f('search'); }],
        ApiSearchResult: ['$stateParams', '$http', function($stateParams, $http) {
          return $http.get('/api/q', { params: { q: $stateParams.q } });
        }]
      },
      controller: "ResultController",
      controllerAs: "ResultCtrl"
    })
    .state('show', {
      url: '/show/:type/:id',
      templateUrl: "/html/_show.html",
      // resolve: { Drive: ['$route', 'RestQ', function($route, RestQ) { return RestQ.save({ id: $route.current.params.id, type: $route.current.params.type }); }] },
      resolve: { Result: ['$stateParams', '$http', function($stateParams, $http) { return $http.post('/api/q', { id: $stateParams.id, type: $stateParams.type }); }] },
      controller: "ShowController",
      controllerAs: "ShowCtrl"
    })
    .state('edit', {
      url: '/edit/:type/:id',
      templateUrl: "/html/_new.html",
      resolve: {// TODO: Create mulitple GET
        Result: ['$stateParams', '$http', function($stateParams, $http) { return $http.post('/api/q', { id: $stateParams.id, type: $stateParams.type }); }],
        NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }]
      },
      controller: "NewController",
      controllerAs: "NewCtrl"
    })
    .state('places', {
        url: '/places',
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
}]);


module.run(['$window', '$rootScope', '$templateCache', 'GlobalService', 'LocationService', 'GPS',
  function ( $window, $rootScope, $templateCache, GlobalService, LocationService, GPS ) {
    if (typeof(Array.prototype.remove) !== "function") {
      Array.prototype.remove = function(cb) {
        var _new = this;
        for (var i = this.length - 1; i >= 0; i--) {
          var elm = this[i];
          if (cb.call(elm)) {
            Array.prototype.splice.call(_new, i, 1);
          }
        }
      };
    }

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
