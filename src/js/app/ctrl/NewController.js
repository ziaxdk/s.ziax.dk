module.controller('NewController', ['$scope', '$http', 'RestDrive', 'Delayer', function ($scope, $http, RestDrive, Delayer) {
  var _t = this, Delayer = new Delayer(2000);
  _t.form = {
    onlyAuth: false,
    type: 'article'
  };
  _t.label = function (val1, val2) {
    return _t.form.type === 'link' ? val2:val1;
  }

  $scope.$watch(function () { return _t.form.header; }, function (n, o) {
    if (n === o) return;
      Delayer.run(function () {
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(n)) {
          _t.form.type = 'place';
          _t.form.location = { lat: 55, lon: 12 };
        }
        else if (/^https?\:\/\//.test(n)) {
          $http.get('/api/scrape', { params: { q: encodeURIComponent(n) } }).success(function (data) {
            // var link = _t.form.header;
            // _t.form.header = data.title1 || data.title2;
            _t.form.url = data.title1 || data.title2; //link;
            _t.form.content = '"' + link + '":' + link + '\n' + data.desc1 || data.desc2;
            _t.form.type = 'link';
          });
        }
        else {
          _t.form.url = null;
          _t.form.type = 'article';
        }
      });
  });
// "Link to Wikipedia":http://www.wikipedia.org
  _t.submit = function () {
    // console.log(_t.form);
    // return;
    if ($scope.theForm.$invalid) return;
    var obj = {
      header: _t.form.header,
      content: _t.form.content,
      url: _t.form.url,
      type: _t.form.type,
      location: _t.form.location,
      tags: _t.form.tags ? _t.form.tags.split(' ') : [],

      code: _t.form.code
    };

    // console.log(obj);
    RestDrive.save(obj);
  };
}]);
