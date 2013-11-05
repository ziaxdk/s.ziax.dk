module.service('UserService', ['$http', function ($http) {
  var me = { isAuth: false };
  $http.get('/me').success(function (data) {
    angular.extend(me, data, { isAuth: true });
  });
  return {
    me: me
  };
}]);
