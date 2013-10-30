;(function () {
	var module = angular.module('ziaxdash', ['ngRoute', 'ngResource']);
  
  // Config
  module.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: "_index.html",
        controller: "IndexController",
        controllerAs: "IndexCtrl"
    });
    $routeProvider.when('/new', {
        templateUrl: "_new.html"
    });
    $routeProvider.when('/show/:id', {
        templateUrl: "_show.html",
        resolve: { Drive: ['$route', 'RestQ', function($route, RestQ) { return RestQ.save({id: $route.current.params.id }); }] },
        controller: "ShowController",
        controllerAs: "ShowCtrl"
    });
    $routeProvider.when('/res/:q', {
        templateUrl: "_result.html",
        resolve: { Drives: ['$route', 'RestQ', function($route, RestQ) { return RestQ.get({ q: $route.current.params.q }); }] },
        controller: "ResultController",
        controllerAs: "ResultCtrl"
    });
    $routeProvider.otherwise({
        redirectTo: "/"
    });
  }]);

  // Factory
  module.factory('RestDrive', ['$resource', function ($resource) {
    return $resource('drive', {}, { 'query':  { method:'GET', isArray: false }});
  }]);
  module.factory('RestQ', ['$resource', function ($resource) {
    return $resource('q');
  }]);
  module.factory('RestClick', ['$resource', function ($resource) {
    return $resource('click/:id', {id: '@id'});
  }]);

  // Controllers

  module.controller('MainController', ['$rootScope', '$location', 'RestDrive', function ($rootScope, $location, RestDrive) {
    var _t = this;
    _t.hits = "na";
    _t.form = { };

    _t.search = function () {
      if (!_t.form.q) return;
      $location.path('/res/' + encodeURIComponent(_t.form.q));
    };

    _t.new = function () {
      $location.path('/new');
    };


    RestDrive.query(null, function (res) {
      _t.hits = res.hits.total;
    });

    $rootScope.$on('$routeChangeStart', function () {
      // ngProgress.start();
    });
    $rootScope.$on('$routeChangeSuccess', function () {
      // ngProgress.complete();
    });
    $rootScope.$on('$routeChangeError', function () {
      // ngProgress.complete();
    });
  }]);

  module.controller('IndexController', ['$location', 'RestQ', function ($location, RestQ) {
    var _t = this;
  }]);

  module.controller('NewController', ['$scope', '$http', 'RestDrive', function ($scope, $http, RestDrive) {
    var _t = this;
    _t.form = {};
    _t.submit = function () {
      if ($scope.theForm.$invalid) return;
      var obj = {
        header: _t.form.header,
        content: _t.form.content,
        tags: _t.form.tags ? _t.form.tags.split(' ') : [],
        createdutc: moment.utc().format()
      };

      RestDrive.save(obj);

    };
  }]);

  module.controller('ShowController', ['Drive', '$http', function (Drive, $http) {
    this.Drive = Drive;
    $http.put('/q', { id: Drive.id });
  }]);

  module.controller('ResultController', ['Drives', '$http', '$location', function (Drives, $http, $location) {
    var _t = this;
    _t.result = Drives;
    _t.show = function (id) {
      $location.path('/show/' + encodeURIComponent(id));
    }
  }]);

  // Directives

  //Filters
  module.filter('textile', ['$sce', function ($sce) {
    return function (val) {
      return !val ? "" : $sce.trustAsHtml(textile.parse(val));
    };
  }]);

  /*module.filter('moment', [function () {
    return function (val) {

      console.log(moment(val).format());
      return val;
    }
  }]);*/

}());
