;(function () {
	var module = angular.module('ziaxdash', ['ngRoute', 'ngResource', 'ngAnimate']);
  
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

  // Run
  module.run(['$http', function($http) {
  }]);

  // Services
  module.service('UserService', ['$http', function ($http) {
    var me = { isAuth: false };
    $http.get('/me').success(function (data) {
      angular.extend(me, data, { isAuth: true });
    });
    return {
      me: me
    };
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

  module.controller('MainController', ['$rootScope', '$location', 'UserService', 'RestDrive', function ($rootScope, $location, UserService, RestDrive) {
    var _t = this;
    _t.hits = null;
    _t.me = UserService.me;
    // _t.me = { isAuth: true, id: 123, name: 'profile.displayName' };
    _t.form = { };

    _t.search = function () {
      if (!_t.form.q) return;
      $location.path('/res/' + encodeURIComponent(_t.form.q));
    };

    _t.new = function () {
      $location.path('/new');
    };
    // _t.oth = function () {
    //   $location.path('/show/3fnjqyrOS96yxqmqBqOjRQ');
    // };

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
    _t.form = {
      onlyAuth: false
    };
    _t.submit = function () {
      // console.log(_t.form);
      // return;
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

  module.controller('ResultController', ['Drives', '$http', '$location', '$route', function (Drives, $http, $location, $route) {
    var _t = this;
    _t.result = Drives;
     $http.put('/history', { q: $route.current.params.q });
    _t.show = function (id) {
      $location.path('/show/' + encodeURIComponent(id));
    };
  }]);

  // Directives

  //Filters
  module.filter('textile', ['$sce', function ($sce) {
    return function (val) {
      return !val ? "" : $sce.trustAsHtml(textile.parse(val));
    };
  }]);

  // module.directive('typeahead', ['$http', '$q', '$parse', function ($http, $q, $parse) {
  //   return {
  //     restrict: 'A',
  //     replace: true,
  //     transclude: true,
  //     template: '<div class="typeahead"><div ng-transclude></div></div>',
  //     link: function (scope, element, attrs) {
  //       var promise,
  //         canceler = false
  //         ;
  //       scope.hits = [];

  //       scope.$watch(function () { return $parse(attrs.typeahead)(scope); }, function (n, o) {
  //         if (n===o) return;
  //         fetchData(n);
  //       });

  //       var fetchData = function (value) {
  //         if (angular.isUndefined(value) || !value) return;

  //         if (canceler) {
  //           promise.resolve();
  //         }
  //         canceler = true;
  //         promise = $q.defer();
  //         $http({ url: '/suggest', method: 'GET', params: { q: value }, timeout: promise.promise }).success(function (data, status) {
  //           if (!data.suggest || !data.suggest_term[0]) return;
  //           // console.log(data.suggest_term[0].options)
  //           scope.hits = [];
  //           angular.forEach(data.suggest_term[0]["options"], function (d) {
  //             // console.log(d);
  //             scope.hits.push(d.text);
  //           });
  //         })["finally"](function () {
  //           canceler = false;
  //         });
  //         return value;
  //       };


  //     }
  //   };
  // }]);


  // https://github.com/ziaxdk/ng-extensions/blob/master/src/directives/ngx-submit.js
  module.directive('ngxSubmit', ['$parse', function ($parse) {
    return function (scope, element, attr) {
      var fn = $parse(attr.ngxSubmit);
      element.on('submit', function (event) {
        element.addClass('ngx-attempt');
        scope.$apply(function () {
          fn(scope, { $event: event });
        });
      });
    };
  }]);

  /*module.filter('moment', [function () {
    return function (val) {

      console.log(moment(val).format());
      return val;
    }
  }]);*/

}());
// <form class="form-inline" role="form" ng-submit="MainCtrl.search()">
//   <div class="col-md-6">
//     <input type="text" placeholder="Search..." ng-model="MainCtrl.form.q" class="form-control">
//     <div typeahead="MainCtrl.form.q">
//       <ul>
//         <li ng-repeat="hit in hits">{{hit}}</li>
//       </ul>
//     </div>
//   </div>
//   <div class="col-md-6">
//     <button type="submit" class="btn btn-default">Search <span class="glyphicon glyphicon-search"></span></button>
//     <button type="button" class="btn btn-default pull-right" ng-click="MainCtrl.new()"><span class="glyphicon glyphicon-plus"></span></button>
//   </div>
// </form>
