module.controller('ResultController', ['Drives', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route', '$timeout',
  function (Drives, RestXQ, Delayer, $scope, $http, $location, $route, $timeout) {
  var _t = this, facetSearch = Delayer(500), first = true;
  // TODO: Consider moving to routeProvider
  // $http.put('/history', { q: $route.current.params.q });
  _t.show = function (hit) {
    // $location.path('/show/' + encodeURIComponent(id));
    $location.path('/show/' + encodeURIComponent(hit.type) + '/' + encodeURIComponent(hit.id));
  };

  _t.allTypes = function () {
    setSelected(_t.types, true);
    doSearch();
  };
  _t.star = function (hit) {
    console.log(hit);
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

  _t.facet = function (hit) {
    hit.selected = !hit.selected;
    doSearch();
  };

  function doSearch () {
    facetSearch.run(function () {
      var tags = [];
      angular.forEach(_t.result.facets.tags.terms, function (val) {
        if (val.selected) tags.push(val.term);
      });
      var types = [];
      angular.forEach(_t.result.facets.types.terms, function (val) {
        if (!val.selected) types.push(val.term);
      });
      // console.log(types);
      RestXQ.save({ 
        q: $route.current.params.q, 
        facets: { tags: tags }, types: types 
      }).$promise.then(function(data) {
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
