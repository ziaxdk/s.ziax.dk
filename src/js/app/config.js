// Config
module.config(['$routeProvider', '$sceDelegateProvider', '$provide', '$httpProvider', function ($routeProvider, $sceDelegateProvider, $provide, $httpProvider) {
  $routeProvider.when('/', {
      templateUrl: "/html/_index.html",
      resolve: { History: ['$http', function($http) { return $http.get('/api/history'); }] },
      controller: "IndexController",
      controllerAs: "IndexCtrl"
  });
  $routeProvider.when('/new', {
      templateUrl: "/html/_new.html",
      resolve: { NewApiResult: ['$http', function($http) { return $http.get('/api/tags'); }] },
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
      resolve: { ApiType: ['ApiTypeFactory', function(f) { return f('places'); }], ApiSearchResult: ['$http', function($http) { return $http.get('/api/places', { cache: false }); }] }
  });
  $routeProvider.otherwise({
      redirectTo: "/"
  });

  $sceDelegateProvider.resourceUrlWhitelist([ 'self', '**']);

  L.Icon.Default.imagePath = "/css/images/";


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

module.run(['$window', '$rootScope', '$templateCache', 'GlobalService',
  function ($window, $rootScope, $templateCache, GlobalService) {
  var location = $window.location;
  var socket = io.connect('//' + location.hostname);
  
  socket.on('news', function (data) {
  });

  socket.on('connect', function (data) {
    $rootScope.$evalAsync(function () {
      // console.log(data);
      if (!data) return;
      GlobalService.count = data.count;
    });
  });
}]);
