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
