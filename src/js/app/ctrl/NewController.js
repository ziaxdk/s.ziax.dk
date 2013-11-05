module.controller('NewController', ['$scope', '$http', 'RestDrive', function ($scope, $http, RestDrive) {
  var _t = this;
  _t.form = {
    onlyAuth: false
  };
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
