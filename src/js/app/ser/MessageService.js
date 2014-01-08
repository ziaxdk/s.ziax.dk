module.service('MessageService', ['$rootScope', function ($rootScope) {

  function err(num, msg) {
    $rootScope.$emit('err', { num: num, msg: msg });
  }

  return {
    err: err
  };
}]);
