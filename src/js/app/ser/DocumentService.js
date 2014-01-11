module.service('DocumentService', ['$http', function ($http) {
  function save(document) {
    return $http.post('/api/document', document);
  }

  return {
    save: save
  };
}]);
