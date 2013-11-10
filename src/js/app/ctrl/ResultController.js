module.controller('ResultController', ['Drives', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route', '$timeout',
  function (Drives, RestXQ, Delayer, $scope, $http, $location, $route, $timeout) {
  var _t = this, facetSearch = Delayer(500), first = true;
  // TODO: Consider moving to routeProvider
  // $http.put('/history', { q: $route.current.params.q });
  _t.show = function (id) {
    $location.path('/show/' + encodeURIComponent(id));
  };

  $timeout(function () {
    _t.showHits = true;
  }, 300);

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
    angular.forEach(_t.result.facets.tags.terms, function (val) {
      val.selected = false;
    });
    doSearch();
  };

  _t.facet = function (me) {
    me.hit.selected = !me.hit.selected;
    doSearch();
  }

  _t.id = function (obj) {
    return obj._id;
  }
  _t.obj = function (obj, key) {
    return obj[key];
  }

  function doSearch () {
    facetSearch.run(function () {
      var tags = [];
      angular.forEach(_t.result.facets.tags.terms, function (val) {
        if (val.selected) tags.push(val.term);
      });
      RestXQ.save({ q: $route.current.params.q, facets: { tags: tags } }).$promise.then(function(data) {
        _t.result.hits = data.hits;
      });
    });
  }
}]);
