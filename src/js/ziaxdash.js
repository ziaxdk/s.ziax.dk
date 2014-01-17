(function () {
var module = angular.module('ziaxdash', ['ngRoute', 'ngResource', 'ngAnimate']);
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
      resolve: { ApiSearchResult: ['$route', '$http', function($route, $http) { return $http.get('/api/q', { params: { q: $route.current.params.q } }); }] },
      controller: "ResultController",
      controllerAs: "ResultCtrl"
  });
  $routeProvider.otherwise({
      redirectTo: "/"
  });

  $sceDelegateProvider.resourceUrlWhitelist([ 'self', 'http://www.ziax.dk/*']);

  L.Icon.Default.imagePath = "/css/images/"


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

module.run(['$window', '$rootScope', 'GlobalService', function ($window, $rootScope, GlobalService) {
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

module.controller('EditController', ['$scope', '$http', 'RestDrive', 'Delayer', '$route', function ($scope, $http, RestDrive, Delayer, $route) {
  var lisLink, lisPlace, lisArticle;
  var _t = this, delayScraper = new Delayer(2000);
  var initQ = $route.current.params.q;

  _t.form = {
    onlyAuth: false,
    type: 'article'
  };
  _t.bigMap = false;
  _t.mapIcon = 'cutlery';

  if (angular.isDefined(initQ) && initQ) {
    _t.form.q = initQ;
  }



  $scope.$watch(function () { return _t.form.q; }, function (q) {
    if (!q) return;
    if (lisLink) lisLink();
    if (lisPlace) lisPlace();
    if (lisArticle) lisArticle();
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
          _t.form.header = data.title1 || data.title2 || data.title3; //link;
          _t.form.content = '"' + _t.form.url + '":' + _t.form.url + '\n\n' + (data.desc1 || data.desc2 || data.desc3);
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

  $scope.$watch(function () {return LocationService.coords; }, function (n) {
    if (!n.hasFix) return;
    console.log('latlon', n);
  });
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

module.controller('NewController', ['$scope', '$http', 'RestDrive', 'DocumentService', 'PlaceService', 'MessageService', 'Delayer', '$route',
  function ($scope, $http, RestDrive, DocumentService, PlaceService, MessageService, Delayer, $route) {
  var lisLink, lisPlace, lisArticle;
  var _t = this, delayScraper = new Delayer(2000);
  var initQ = $route.current.params.q;

  _t.form = {
    onlyAuth: false,
    type: 'article'
  };
  _t.bigMap = false;
  _t.mapIcon = 'cutlery';
  _t.mapIcons = PlaceService.poi;

  if (angular.isDefined(initQ) && initQ) {
    _t.form.q = initQ;
  }

  $scope.$watch(function () { return _t.form.q; }, function (q) {
    if (!q) return;
    if (lisLink) lisLink();
    if (lisPlace) lisPlace();
    if (lisArticle) lisArticle();
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
          _t.form.header = data.title1 || data.title2 || data.title3; //link;
          _t.form.content = '"' + _t.form.url + '":' + _t.form.url + '\n\n' + (data.desc1 || data.desc2 || data.desc3);
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
      icon: PlaceService.getPoi(_t.mapIcon).type,
      location: _t.form.location,
      tags: _t.form.tags ? _t.form.tags.split(' ') : [],
      onlyAuth: _t.form.onlyAuth,
      code: _t.form.code
    };

    // console.log(obj);
    // RestDrive.save(obj);
    DocumentService.save(obj).then(function () {
      MessageService.ok("Saved");
    }, function (err) {
      MessageService.err(err.status, err.data);
    });

  };
}]);

module.controller('ResultController', ['ApiSearchResult', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route', '$timeout',
  function (ApiSearchResult, RestXQ, Delayer, $scope, $http, $location, $route, $timeout) {
  var _t = this, 
      facetSearch = Delayer(500), 
      first = true,
      starDelayer = Delayer(100)
      ;
  _t.result = ApiSearchResult.data;
  var facetTerms = _t.result.facets.tags.terms;
  var facetTypes = _t.result.facets.types.terms;
  _t.idx = 0;
  setSelected(facetTypes, true);

  _t.facetTermsOperator = "and";

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

  _t.pager = function(c) {
    _t.idx = c;
  }

  $scope.$watch(function() { return _t.idx; }, function(n) {
    if (!n) return;
    doSearch();
  });

  function doSearch () {
    facetSearch.run(function () {
      $http.post('/api/xq', { q: $route.current.params.q, facets: { tags: { terms: getSelectedFacet(facetTerms), operator: _t.facetTermsOperator } }, types: getSelectedFacet(facetTypes), pager: { idx: _t.idx } }).success(function (data) {
        _t.result.hits = data.hits;
        filterFacet(facetTerms, data.facets.tags.terms);
      });
    });
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
      };

    };
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


module.controller('ShowController', ['Result', '$http', function (Result, $http) {
  this.Result = Result.data;

  if (this.Result.source.location) {
    this.Result.source.location.leaflet = this.Result.source.location.lat + ',' + this.Result.source.location.lon;
  }
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

module.directive('dashLeafletMarkers', ['$parse', 'PlaceService', function ($parse, PlaceService) {
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
        // console.log(icon)
      }

    }],
    link: function(scope, element, attrs) {
      _iconG = $parse(attrs.icon);
      _iconS = _iconG.assign;

    }
  }
}]);

module.directive('dashLeafletMarker', ['$parse', 'PlaceService', function ($parse, PlaceService) {
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
      }
    }],
    link: function(scope, element, attrs, ctrl) {
      var poi = PlaceService.getPoi(attrs.icon);
      scope.icon = poi.name;
      scope.color = poi.color;
      parent = ctrl;
    }
  }
}]);
module.directive('dashLeaflet', ['$parse', 'PlaceService', function ($parse, PlaceService) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var map = L.map(element[0], { center: [0, 0], zoom: 12 }),
          bigMapGet = $parse(attrs.dashLeafletBig),
          bigMapSet = bigMapGet.assign,
          bigMapEnabled = bigMapGet(scope),
          latLonGet = $parse(attrs.dashLeaflet),
          latLonSet = latLonGet.assign,
          latlon = [0, 0],
          leafletMarker = L.marker(latlon, { draggable: true, icon: L.AwesomeMarkers.icon({ icon: 'fa-spinner', markerColor: 'darkpurple', prefix: 'fa' }) });

      // <!-- 'red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue' -->
      leafletMarker.on('dragend', function (evt) {
        var ll = this.getLatLng();
        scope.$evalAsync(function () {
          latLonSet(scope, ll.lat.toFixed(4) + ',' + ll.lng.toFixed(4));
        })
      });
      if (attrs.dashLeafletReadonly && attrs.dashLeafletReadonly === 'true') {
        leafletMarker.options.draggable = false;
      }

      var layer = L.featureGroup().addTo(map);
      L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }).addTo(map);
      leafletMarker.addTo(layer);


      if (angular.isDefined(bigMapEnabled) && typeof bigMapEnabled === 'boolean') {
        var MyControl = L.Control.extend({
            options: {
                position: 'topright'
            },

            onAdd: function (map) {
                // create the control container with a particular class name
                var container = L.DomUtil.create('div', 'my-custom-control');
                container.setAttribute('aria-haspopup', true);

                var link = L.DomUtil.create('a', 'dash-control-big', container);
                link.href = 'javascript:;';
                link.title = "Upscale";
                link.innerText = 'X';

                L.DomEvent
                  .on(link, 'click', function () {
                    scope.$evalAsync(function () {
                      bigMapSet(scope, !bigMapEnabled);
                    });
                  });
                return container;
            }
        });
        map.addControl(new MyControl());
      }

      scope.$watch(function () { return scope.$eval(attrs.dashLeaflet) }, function (value) {
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
          latlon = value.split(',');
          leafletMarker.setLatLng(latlon);
          map.setView(latlon);
      }});

      attrs.$observe('dashLeafletIcon', function (val) {
        if (!val) return;
        var poi = PlaceService.getPoi(val)
        leafletMarker.setIcon(L.AwesomeMarkers.icon({ icon: 'fa-' + poi.name, markerColor: poi.color, prefix: 'fa' }));
      });
    }
  }; 
}]);

module.directive('ngSetFocus', [function () {
  return function (scope, element, attrs) {
    element[0].focus();
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
      }
    }]
  }
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
      '<li ng-repeat="n in data" ng-class="{active: idx == n.idx}"><a href="javascript:;" ng-click="click(n)">{{n.idx}}</a></li>' +
    '</ul></div>',
    scope: {
      change: '&'
    },
    controller: ['$scope', function ($scope) {
      $scope.click = function(n) {
        // console.log(this, n, $scope)
        $scope.change({idx: n.idx - 1});
      }
    }],
    link: function(scope, element, attrs) {
      var size = 10;
      scope.idx = 0;
      scope.data = [];
      // console.log('link', arguments);
      // attrs.$observe(attrs.count, function (value) {
      //   console.log(value)
      // })

      // console.log(attrs.count)

      attrs.$observe('idx', function(value) {
        scope.idx = value;
      });
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

module.service('DocumentService', ['$http', function ($http) {
  function save(document) {
    return $http.post('/api/document', document);
  }

  return {
    save: save
  };
}]);

module.service('GlobalService', ['$http', function ($http) {


  return {
    count: 0
  };
}]);

module.service('LocationService', ['$window', '$rootScope', function ($window, $rootScope) {
	var coords = {
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
	};

	if (navigator.geolocation) {
		// navigator.geolocation.getCurrentPosition(whenLocated);
		navigator.geolocation.watchPosition(whenLocated);
	}
	else {
		console.log('location not supported');
	};

	return {
		coords: coords
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
  };

  var poi = [
      { name: 'cutlery', type: 'cutlery', color: 'cadetblue', title: 'Restaurant' },
      { name: 'coffee', type: 'coffee', color: 'darkred', title: 'Coffee' },
      { name: 'shopping-cart', type: 'shopping-cart', color: 'darkgreen', title: 'Shopping' },
      { name: 'eye', type: 'eye', color: 'blue', title: 'Viewpoint' },
      { name: 'camera', type: 'camera', color: 'orange', title: 'Photography' },
      { name: 'home', type: 'home', color: 'red', title: 'Hotel' }
    ],
  getPoi = function (name) {
    return each(function (poi) { return poi.name === name });
  };


  return {
    poi: poi,
    getPoi: getPoi

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