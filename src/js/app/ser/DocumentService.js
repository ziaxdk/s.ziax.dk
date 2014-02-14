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
