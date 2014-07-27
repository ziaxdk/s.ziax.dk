module.controller('MainController', ['$scope', '$rootScope', '$location', '$window', 'UserService', 'GlobalService', 'RestDrive', 
  function ($scope, $rootScope, $location, $window, UserService, GlobalService, RestDrive) {
  var _t = this;
  _t.global = GlobalService;
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
    var nw = $window.open('/api/auth/google', 'popupGoog', 'height=600,width=450');
    if ($window.focus) nw.focus();
    console.log('b');
  };

  // _t.suggest = [{dis: '1'}, {dis: '2'}, {dis: '3'}];
  // _t.suggestIdx = -1;
  // _t.suggestBackup = null;
  // _t.keyDown = function(evt) {
  //   console.log(evt.keyCode);
  //   var code = evt.keyCode;
  //   switch(code) {
  //     case 27: // esc
  //       _t.suggest = [];
  //       _t.suggestIdx = -1;
  //       if (!_t.suggestBackup) return;
  //       _t.form.q = _t.suggestBackup;
  //       _t.suggestBackup = null;
  //       break;

  //     case 40: // down
  //       if (_t.suggestIdx == _t.suggest.length-1) return;
  //       if (!_t.suggestBackup) _t.suggestBackup = _t.form.q;
  //       var item = _t.suggest[++_t.suggestIdx];
  //       //console.log('item', item);
  //       _t.form.q = item.dis;
  //       break;

  //     case 38: // up
  //       if (_t.suggestIdx == -1) return;
  //       _t.suggestIdx--;
  //       if (_t.suggestIdx == -1) {
  //         _t.form.q = _t.suggestBackup;
  //         _t.suggestBackup = null;
  //       }
  //       break;

  //     case 13: // enter
  //       if (_t.suggestIdx == -1 ) return;
  //       console.log('do');
  //       evt.preventDefault();
  //       break;
  //   }
  // }


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
