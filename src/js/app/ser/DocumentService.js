module.service('DocumentService', ['$http', 'MessageService', function ($http, MessageService) {
  function save(document) {
    return $http.post('/api/document', document);
  }
  function update(document) {
    return $http.put('/api/document', document);
  }
  function store(document) {
    return $http.post('/api/document2', document).then(
      function() { MessageService.ok('Ok'); },
      function(err) { MessageService.err(err.status, err.data); }
    );
  }

  return {
    save: save,
    update: update,
    store: store
  };
}]);
