module.factory('RestDrive', ['$resource', function ($resource) {
  return $resource('api/drive', {}, { 'query':  { method:'GET', isArray: false }});
}]);
module.factory('RestQ', ['$resource', function ($resource) {
  return $resource('api/q');
}]);
module.factory('RestXQ', ['$resource', function ($resource) {
  return $resource('api/xq');
}]);
module.factory('RestClick', ['$resource', function ($resource) {
  return $resource('api/click/:id', {id: '@id'});
}]);
