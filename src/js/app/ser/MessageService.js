module.service('MessageService', ['$rootScope', function ($rootScope) {
  function emit(type, num, msg) {
    $rootScope.$emit(type, { num: num, msg: msg });
  }

  function err(num, msg) {
    emit('err', num, msg);
  }

  function ok(msg) {
    emit('ok', 0, msg);
  }

  return {
    err: err,
    ok: ok
  };
}]);
