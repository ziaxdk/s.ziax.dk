module.controller('ResultController', ['ApiType', 'ApiSearchResult', 'RestXQ', 'Delayer', '$scope', '$http', '$location', '$route', '$timeout',
  function (ApiType, ApiSearchResult, RestXQ, Delayer, $scope, $http, $location, $route, $timeout) {
  var _t = this,
      facetSearch = Delayer(500),
      first = true,
      starDelayer = Delayer(100)
      ;


  _t.result = ApiSearchResult.data;
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

