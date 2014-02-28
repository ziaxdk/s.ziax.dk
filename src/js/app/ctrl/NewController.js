module.controller('NewController', ['NewApiResult', 'Result', '$scope', '$http', 'RestDrive', 'DocumentService', 'PlaceService', 'MessageService', 'AirportService', 'Delayer', '$route',
  function (NewApiResult, Result, $scope, $http, RestDrive, DocumentService, PlaceService, MessageService, AirportService, Delayer, $route) {
  var lisLink, lisPlace, lisArticle;
  var _t = this, delayScraper = new Delayer(2000);
  var initQ = $route.current.params.q;

  _t.tags = NewApiResult;
  _t.form = {
    onlyAuth: false,
    type: 'article'
  };
  _t.form.flights = [];
  _t.bigMap = false;
  _t.mapSize = 's';
  _t.mapIcon = 'cutlery';
  _t.mapIcons = PlaceService.poi;

  // $scope.$watch(function() { return _t.mapSize; }, function(v) { console.log('mapSize', v) })
  // $scope.$watch(function() { return _t.form.q; }, function(v) { console.log('q', v) })

  if (Result && Result.data) {
    // console.log(Result.data.source);
    var result = Result.data.source;
    _t.form.header = _t.form.q = result.header;
    _t.form.content = result.content;
    _t.form.tags = result.tags;
    _t.form.onlyAuth = result.onlyAuth;
    _t.form.utl = result.url;
    _t.form.id = Result.data.id;
    _t.form.type = Result.data.type;
  }

  if (angular.isDefined(initQ) && initQ) {
    _t.form.q = initQ;
  }

  $scope.$watch(function () { return _t.form.q; }, function (q) {
    if (!q) return;
    if (lisLink) lisLink();
    if (lisPlace) lisPlace();
    if (lisArticle) lisArticle();
    if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(q)) {
      _t.form.type = 'place';
      _t.form.header = null;
      lisPlace = $scope.$watch(function () { return _t.form.q; }, function (n) { _t.form.location = n; });
    }
    else if (/^https?\:\/\//.test(q)) {
      _t.form.type = 'link';
      lisLink = $scope.$watch(function () { return _t.form.q; }, function (n) { _t.form.url = n; });
      delayScraper.run(function () {
        $http.get('/api/scrape', { params: { q: encodeURIComponent(q) } }).success(function (data) {
          _t.form.header = data.title1 || data.title2 || data.title3; //link;
          _t.form.content = '"' + _t.form.url + '":' + _t.form.url + '\n\n' + (data.desc1 || data.desc2 || data.desc3);
        });
      });
    }
    // else if (/^([A-Z]{4})(\-?([A-Z]{0,4})*$)/.test(q)) {
    else if (/^([A-Z]{4})(\-[A-Z]{4})+/.test(q)) {
      _t.form.type = 'flight';
      var airports = q.split('-');
      AirportService.get(airports).then(function(data) {
        angular.forEach(data.data.docs, function(d) {
          if (d.found) {
           _t.form.flights.push(d.source);
          }
        });
      });
    }
    else {
      _t.form.type = 'article';
      lisArticle = $scope.$watch(function () { return _t.form.q; }, function (n) { _t.form.header = n; });
    }
  });

  // "Link to Wikipedia":http://www.wikipedia.org
  _t.submit = function () {
    // console.log(_t.form);
    // return;
    if ($scope.theForm.$invalid) return;
    var obj = {
      id: _t.form.id,
      header: _t.form.header,
      content: _t.form.content,
      url: _t.form.url,
      type: _t.form.type,
      icon: PlaceService.getPoi(_t.mapIcon).type,
      location: _t.form.location,
      flights: _t.form.flights,
      tags: _t.form.tags||[],
      onlyAuth: _t.form.onlyAuth
    };

    // console.log(obj);
    // return;
    if (obj.id) {
      DocumentService.update(obj).then(function () {
        MessageService.ok("Updated");
      }, function (err) {
        MessageService.err(err.status, err.data);
      });

    }
    else {
      DocumentService.save(obj).then(function () {
        MessageService.ok("Saved");
      }, function (err) {
        MessageService.err(err.status, err.data);
      });
    }
  };
}]);
