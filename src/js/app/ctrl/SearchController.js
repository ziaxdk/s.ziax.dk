module.controller('SearchController', ['SEARCH', 'Tags', function (SEARCH, Tags) {
  this.esTags = Tags.data.facets.tags.terms;
  this.esTypes = SEARCH.TYPES;

  this.search = function() {
    console.log('search', this.types, this.tags);
  };
}]);
