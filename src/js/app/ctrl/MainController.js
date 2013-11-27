module.controller('MainController', ['$scope', '$rootScope', '$location', '$routeParams', 'UserService', 'RestDrive', 
  function ($scope, $rootScope, $location, $routeParams, UserService, RestDrive) {
  var _t = this;
  _t.hits = null;
  _t.me = UserService.me;
  // _t.me = { isAuth: true, id: 123, name: 'profile.displayName' };
  _t.form = { };
  _t.doFocus = true;

  _t.search = function () {
    if (!_t.form.q) return;
    $scope.searchForm.q.$setPristine();
    $location.path('/res/' + encodeURIComponent(_t.form.q));
  };

  _t.new = function () {
    $location.path('/new');
  };

  _t.newLogin = function () {
    _t.iframeUrl = "/api/auth/google"
  };

  RestDrive.query(null, function (res) {
    _t.hits = res.count;
  });

  $rootScope.$on('$routeChangeStart', function () {
    // ngProgress.start();
  });
  $rootScope.$on('$routeChangeSuccess', function (scope, route) {
    _t.form.q = route.params.q;
    // ngProgress.complete();
  });
  $rootScope.$on('$routeChangeError', function () {
    // ngProgress.complete();
  });
}]);
