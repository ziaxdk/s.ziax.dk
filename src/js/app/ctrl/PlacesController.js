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
