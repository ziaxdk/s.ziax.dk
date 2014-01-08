module.service('DocumentService', ['$http', function ($http) {
  function save(document) {
    console.log('saving', document);
    return $http.post('/api/document', document);
  }

  return {
    save: save
  };
}]);
