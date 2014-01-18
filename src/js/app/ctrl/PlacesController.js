module.controller('PlacesController', ['ApiSearchResult',
  function (ApiSearchResult) {
    this.places = ApiSearchResult.data.hits.hits;
}]);
