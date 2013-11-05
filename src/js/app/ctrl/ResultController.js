module.controller('ResultController', ['Drives', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route',
  function (Drives, RestXQ, Delayer, $scope, $http, $location, $route) {
  var _t = this, facetSearch = Delayer(1000), first = true;
  // TODO: Consider moving to routeProvider
  $http.put('/history', { q: $route.current.params.q });
  _t.show = function (id) {
    $location.path('/show/' + encodeURIComponent(id));
  };

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
