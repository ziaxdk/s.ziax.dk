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
      resolve: { ApiType: ['ApiTypeFactory', function(f) { return f('places'); }], ApiSearchResult: ['$http', function($http) { return $http.get('/api/placeswithiss', { cache: false }); }] }
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

module.controller('NewController', ['NewApiResult', 'Result', '$scope', '$http', 'RestDrive', 'DocumentService', 'PlaceService', 'MessageService', 'AirportService', 'Delayer', '$route',
  function (NewApiResult, Result, $scope, $http, RestDrive, DocumentService, PlaceService, MessageService, AirportService, Delayer, $route) {
  var lisLink, lisPlace, lisArticle;
  var _t = this, delayScraper = new Delayer(2000);
  var initQ = $route.current.params.q;

  _t.tags = NewApiResult;
  _t.form = {
    onlyAuth: false,
    type: 'article'
  };
  _t.form.flights = [];
  _t.bigMap = false;
  _t.mapSize = 's';
  _t.mapIcon = 'cutlery';
  _t.mapIcons = PlaceService.poi;

  // $scope.$watch(function() { return _t.mapSize; }, function(v) { console.log('mapSize', v) })
  // $scope.$watch(function() { return _t.form.q; }, function(v) { console.log('q', v) })

  if (Result && Result.data) {
    // console.log(Result.data.source);
    var result = Result.data.source;
    _t.form.header = _t.form.q = result.header;
    _t.form.content = result.content;
    _t.form.tags = result.tags;
    _t.form.onlyAuth = result.onlyAuth;
    _t.form.utl = result.url;
    _t.form.id = Result.data.id;
    _t.form.type = Result.data.type;
  }

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
    else if (/^([A-Z]{4})\-?([A-Z]{0,4})$/.test(q)) {
      _t.form.type = 'flight';
      var airports = q.split('-');
      AirportService.get(airports[0]).then(function(data) {
        _t.form.flights.push(data.data.source);
      });
      AirportService.get(airports[1]).then(function(data) {
        _t.form.flights.push(data.data.source);
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
      id: _t.form.id,
      header: _t.form.header,
      content: _t.form.content,
      url: _t.form.url,
      type: _t.form.type,
      icon: PlaceService.getPoi(_t.mapIcon).type,
      location: _t.form.location,
      tags: _t.form.tags||[],
      onlyAuth: _t.form.onlyAuth
    };

    // console.log(obj);
    // return;
    if (obj.id) {
      DocumentService.update(obj).then(function () {
        MessageService.ok("Updated");
      }, function (err) {
        MessageService.err(err.status, err.data);
      });

    }
    else {
      DocumentService.save(obj).then(function () {
        MessageService.ok("Saved");
      }, function (err) {
        MessageService.err(err.status, err.data);
      });
    }
  };
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

module.controller('ResultController', ['ApiType', 'ApiSearchResult', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route', '$timeout',
  function (ApiType, ApiSearchResult, RestXQ, Delayer, $scope, $http, $location, $route, $timeout) {
  var _t = this,
      facetSearch = Delayer(500),
      first = true,
      starDelayer = Delayer(100)
      ;


  _t.result = ApiSearchResult.data.places;
  _t.tle = ApiSearchResult.data.tle;

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
      };
    }]
  };
}]);

module.directive('zMap', ['$parse', '$location', 'PlaceService', function ($parse, $location, PlaceService) {
  return {
    restrict: 'A',
    // scope: {},
    // priority: 1,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var t = this,
          map = L.map($element[0], { center: [0, 0], zoom: 12 }),
          base1 = L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }).addTo(map),
          base2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '' }),
          base3 = L.bingLayer("Alv2HutsIUPb_D2Jz0KdN37XixBdCph40lz8uMUNyUM2yp3IPg0oaiHn-J0ieMU4");
          chooser = L.control.layers({ 'Modern': base1, 'Basic': base2, 'Bing': base3 }, {}, { position: 'bottomleft' }).addTo(map);

      t.map = map;
      t.chooser = chooser;

      $scope.$on('$destroy', function() {
        map.remove();
      });

    }],
    link: function(scope, element, attrs) {
    }
  };
}]);

module.directive('zMapMarkers', ['$compile', '$rootScope', '$location', 'PlaceService',
  function ($compile, $rootScope, $location, PlaceService) {

  return {
    restrict: 'A',
    require: 'zMap',
    // priority: 2,
    // scope: true,
    compile: function() {
      var nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            chooser = zmap.chooser,
            layers = L.featureGroup().addTo(map);

        attrs.$observe('zMapMarkers', function(places) {
          layers.clearLayers();
          angular.forEach(angular.fromJson(places), function(hit) {
            var place = hit.source,
                poi = PlaceService.getPoiDefault(place.icon),
                marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
                  .on('click', function() { scope.$evalAsync(function() { $location.path('/show/' + hit.type + '/' + encodeURIComponent(hit.id)); }); })
                  .on('mouseover', function() { marker.openPopup(); })
                  .on('mouseout', function() { marker.closePopup(); })
                  .bindPopup(hit.source.header, { closeButton: false })
                  .addTo(layers);

          });
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
            bigS = bigG.assign;

        nScope.setSize = function(size) {
          nScope.sizeAct = size;
          bigS(scope, size);
        };

        var s = bigG(scope);
        if (s) nScope.sizeAct = s;

        nScope.groupSize = 'btn-group-sm';
        if (attrs.zMapSizerSize) nScope.groupSize = 'btn-group-' + attrs.zMapSizerSize;
        map.addControl(LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-sizer'}));

        scope.$on('$destroy', function() {
          nScope.$destroy();
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
          pos = markerG(scope).split(','),
          layer = L.featureGroup().addTo(map),
          marker = L.marker(pos, {
            draggable: true,
            icon: L.AwesomeMarkers.icon({ icon: 'fa-spinner', markerColor: 'darkpurple', prefix: 'fa' }) })
          .on('drag', function(e) {
            click(e.target);
          })
          .addTo(layer);

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
      var html = $compile('<div class="leaflet-control-layers z-map-tags-control"><div class="list-group"><a ng-class="{active: tag.selected}" href="javascript:;" ng-click="facet(tag)" ng-repeat="tag in tags track by tag.term" class="list-group-item"><span class="badge">{{tag.count}}</span>{{tag.term}}</a></div></div>'),
          nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map;
        nScope.tags = [];

        nScope.facet = function(hit) {
          scope.$eval(attrs.zMapTagsControlCb, {hit: hit});
        };

        scope.$watch(function () { return scope.$eval(attrs.zMapTagsControl); }, function (value) {
          nScope.tags = value;
        });
        
        map.addControl(LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-tags-select', position: 'bottomright'}));
        scope.$on('$destroy', function() {
          nScope.$destroy();
        });
      };
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
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup().addTo(map),
          path = null,
          run = null,
          iss = L.marker([0, 0]).addTo(layer);

      // 20-02-2014
      var tle_line_1 = "1 25544U 98067A   14050.52955885  .00016717  00000-0  10270-3 0  9004";
      var tle_line_2 = "2 25544  51.6500 322.8568 0003647 155.3472 204.7854 15.50497588 33075";
      var tle = attrs.zMapIss;
      if (tle) {
        var atle = $parse(tle)(scope);
        if (angular.isArray(atle)) {
          tle_line_1 = atle[0];
          tle_line_2 = atle[1];
          // console.log('tle parsed', tle_line_1, tle_line_2);
        }
      }
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
      run = $interval(calc, 1000);
      calc();

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
          path = L.polyline([], { color: 'red', noClip: true }).addTo(map);

      attrs.$observe('zMapFlights', function(v) {
        v = $parse(v)(scope);
        if (!v || !angular.isArray(v)) return;
        layer.clearLayers();
        path.setLatLngs([]);
        angular.forEach(v, function(p) {
          var ll = L.latLng([p.location[1], p.location[0]]);
          L.marker(ll).addTo(layer);
          path.addLatLng(ll);
        });
        if (v.length > 1)
          map.fitBounds(layer.getBounds());
      });

      scope.$on('$destroy', function() {
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

module.service('AirportService', ['$http', function ($http) {
  function get(code) {
    return $http.get('/api/airport', { params: { code: code } });
  }

  return {
    get: get
  };
}]);

module.service('DocumentService', ['$http', function ($http) {
  function save(document) {
    return $http.post('/api/document', document);
  }
  function update(document) {
    return $http.put('/api/document', document);
  }

  return {
    save: save,
    update: update
  };
}]);

module.service('GlobalService', ['$http', function ($http) {


  return {
    count: 0
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
  function getPoiDefault(name) {
    var poi = getPoi(name);
    return poi != null ? poi : { type:'spinner', color: 'darkpurple' };
  }


  return {
    poi: poi,
    getPoi: getPoi,
    getPoiDefault: getPoiDefault

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