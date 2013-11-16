module.controller('NewController', ['$scope', '$http', 'RestDrive', 'Delayer', function ($scope, $http, RestDrive, Delayer) {
  var _t = this, Delayer = new Delayer(3000);
  _t.form = {
    onlyAuth: false
  };
  _t.findType = function (me) {

  };

  $scope.$watch(function () { return _t.form.header; }, function (n, o) {
    if (n === o) return;
     if (/^https?\:\/\//.test(n)) {
      Delayer.run(function () {
        $http.get('/api/scrape', { params: { q: n } }).success(function (data) {
          _t.form.content = data.content;
        });
      });
     }
  });

  _t.submit = function () {
    // console.log(_t.form);
    // return;
    if ($scope.theForm.$invalid) return;
    var obj = {
      header: _t.form.header,
      content: _t.form.content,
      tags: _t.form.tags ? _t.form.tags.split(' ') : [],
      createdutc: moment.utc().format()
    };

    RestDrive.save(obj);
  };
}]);
