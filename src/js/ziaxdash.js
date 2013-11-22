(function () {
var module = angular.module('ziaxdash', ['ngRoute', 'ngResource', 'ngAnimate']);
// Config
module.config(['$routeProvider', '$sceDelegateProvider', function ($routeProvider, $sceDelegateProvider) {
  $routeProvider.when('/', {
      templateUrl: "/html/_index.html",
      resolve: { History: ['$http', function($http) { return $http.get('/api/history'); }] },
      controller: "IndexController",
      controllerAs: "IndexCtrl"
  });
  $routeProvider.when('/new', {
      templateUrl: "/html/_new.html",
      controller: "NewController",
      controllerAs: "NewCtrl"
  });
  $routeProvider.when('/show/:id', {
      templateUrl: "/html/_show.html",
      resolve: { Drive: ['$route', 'RestQ', function($route, RestQ) { return RestQ.save({id: $route.current.params.id }); }] },
      controller: "ShowController",
      controllerAs: "ShowCtrl"
  });
  $routeProvider.when('/res/:q', {
      templateUrl: "/html/_result.html",
      resolve: { Drives: ['$route', 'RestQ', function($route, RestQ) { return RestQ.get({ q: $route.current.params.q }); }] },
      controller: "ResultController",
      controllerAs: "ResultCtrl"
  });
  $routeProvider.otherwise({
      redirectTo: "/"
  });

  $sceDelegateProvider.resourceUrlWhitelist([ 'self', 'http://www.ziax.dk/*']);

  L.Icon.Default.imagePath = "/css/images/"

}]);

module.controller('IndexController', ['History', '$location',
  function (History, $location) {
  var _t = this;
  _t.history = History.data.facets.history.terms;
  

  _t.search = function (q) {
    $location.path('res/' +  encodeURIComponent(q.term));
  };
}]);

module.controller('MainController', ['$scope', '$rootScope', '$location', '$routeParams', 'UserService', 'RestDrive', 
  function ($scope, $rootScope, $location, $routeParams, UserService, RestDrive) {
  var _t = this;
  _t.hits = null;
  _t.me = UserService.me;
  // _t.me = { isAuth: true, id: 123, name: 'profile.displayName' };
  _t.form = { };

  _t.search = function () {
    if (!_t.form.q) return;
    $scope.searchForm.q.$setPristine();
    $location.path('/res/' + encodeURIComponent(_t.form.q));
  };

  _t.new = function () {
    $location.path('/new');
  };

  _t.newLogin = function () {
    _t.iframeUrl = "/api/auth/google"
  };

  RestDrive.query(null, function (res) {
    _t.hits = res.count;
  });

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

module.controller('NewController', ['$scope', '$http', 'RestDrive', 'Delayer', function ($scope, $http, RestDrive, Delayer) {
  var _t = this, delayScraper = new Delayer(2000);
  _t.form = {
    onlyAuth: false,
    type: 'article'
  };

  var lisLink, lisPlace, lisArticle;

  var resetListeners = function () {
    if (lisLink) lisLink();
    if (lisPlace) lisPlace();
    if (lisArticle) lisArticle();
  };


  $scope.$watch(function () { return _t.form.q; }, function (q) {
    if (!q) return;
    resetListeners();
    if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(q)) {
      _t.form.type = 'place';
      _t.form.header = null;
      lisPlace = $scope.$watch(function () { return _t.form.q; }, function (n) { _t.form.location = n; });
    }
    else if (/^https?\:\/\//.test(q)) {
      _t.form.type = 'link';
      lisLink = $scope.$watch(function () { return _t.form.q; }, function (n) { _t.form.url = n; });
      delayScraper.run(function () {
        $http.get('/api/scrape', { params: { q: encodeURIComponent(q) } }).success(function (data) {
          _t.form.header = data.title1 || data.title2; //link;
          _t.form.content = '"' + _t.form.url + '":' + _t.form.url + '\n\n' + data.desc1 || data.desc2;
        });
      });

    }
    else {
      _t.form.type = 'article';
      lisArticle = $scope.$watch(function () { return _t.form.q; }, function (n) { _t.form.header = n; });
    }
  });

  // "Link to Wikipedia":http://www.wikipedia.org
  _t.submit = function () {
    // console.log(_t.form);
    // return;
    if ($scope.theForm.$invalid) return;
    var obj = {
      header: _t.form.header,
      content: _t.form.content,
      url: _t.form.url,
      type: _t.form.type,
      location: _t.form.location,
      tags: _t.form.tags ? _t.form.tags.split(' ') : [],
      onlyAuth: _t.form.onlyAuth,
      code: _t.form.code
    };

    // console.log(obj);
    RestDrive.save(obj);
  };
}]);

module.controller('ResultController', ['Drives', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route', '$timeout',
  function (Drives, RestXQ, Delayer, $scope, $http, $location, $route, $timeout) {
  var _t = this, facetSearch = Delayer(500), first = true;
  // TODO: Consider moving to routeProvider
  // $http.put('/history', { q: $route.current.params.q });
  _t.show = function (id) {
    $location.path('/show/' + encodeURIComponent(id));
  };
  _t.types = [ {term: 'article', selected: true}, {term: 'link', selected: true}, {term: 'place', selected: true} ];
  _t.allTypes = function () {
    setSelected(_t.types, true);
    doSearch();
  };

  // $timeout(function () {
    _t.showHits = true;
  // }, 300);

  _t.result = Drives;
  // _t.result = {
  //   facets: {
  //     tags: {
  //       terms: [{term: "node", selected: false}, {term:"js", selected: false}]
  //     }
  //   },
  //   hits: {
  //     hits: []
  //   }
  // };
  _t.facetClear = function () {
    setSelected(_t.result.facets.tags.terms, false);
    doSearch();
  };

  _t.facet = function (me) {
    me.hit.selected = !me.hit.selected;
    doSearch();
  };

  function doSearch () {
    facetSearch.run(function () {
      var tags = [];
      angular.forEach(_t.result.facets.tags.terms, function (val) {
        if (val.selected) tags.push(val.term);
      });
      var types = [];
      angular.forEach(_t.types, function (val) {
        if (val.selected) types.push(val.term);
      });
      RestXQ.save({ q: $route.current.params.q, facets: { tags: tags }, types: types }).$promise.then(function(data) {
        _t.result.hits = data.hits;
      });
    });
  }

  function setSelected (col, val) {
    angular.forEach(col, function (item) {
      item.selected = val;
    });
  }
}]);

module.controller('ShowController', ['Drive', '$http', function (Drive, $http) {
  this.Drive = Drive;
  // $http.put('/q', { id: Drive.id });
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

module.directive('dashLeaflet', [function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var map = L.map(element[0], {
        center: [0, 0],
        zoom: 12
      });
      L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{
        attribution:''
      }).addTo(map);
      var layer = L.featureGroup().addTo(map);


      scope.$watch(function () {
        return scope.$eval(attrs.dashLeaflet);
      }, function (value) {
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
          var latlon = value.split(',');
          layer.clearLayers();
          L.marker(latlon).addTo(layer);
          map.setView(latlon);
        }
      });




    }
  }; 
}]);

module.directive('dashAheadInput', [function () {
  return function(scope, element, attrs) {
    console.log('link');
  };
}]);

module.directive('dashAhead', [function () {
  return {
    restrict: 'E',
    link: function (scope, element, attrs, ctrl) {
      console.log(arguments);
    }
  }
}]);

module.factory('Delayer', ['$timeout', function ($timeout) {
  var delayer = function (delayInMs) {
    var canceler;
    return {
      run: function (actionToExecute) {
        if (canceler) $timeout.cancel(canceler);
        canceler = $timeout(actionToExecute, delayInMs);
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

module.filter('textile', ['$sce', function ($sce) {
  return function (val) {
    return !val ? "" : $sce.trustAsHtml(textile.parse(val));
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