module.factory('RestDrive', ['$resource', function ($resource) {
  return $resource('drive', {}, { 'query':  { method:'GET', isArray: false }});
}]);
module.factory('RestQ', ['$resource', function ($resource) {
  return $resource('q');
}]);
module.factory('RestXQ', ['$resource', function ($resource) {
  return $resource('xq');
}]);
module.factory('RestClick', ['$resource', function ($resource) {
  return $resource('click/:id', {id: '@id'});
}]);
