module.controller('NewController', ['$scope', '$route', '$http', 'NewApiResult', 'Result', 'PlaceService', 'DelayerFactory', 'DocumentService',
  function ( $scope, $route, $http, NewApiResult, Result, PlaceService, DelayerFactory, DocumentService ) {
    // Init
    var id,
        fnSave = angular.noop,
        delayScraper = new DelayerFactory(2000),
        clickType;


    $scope.tags = NewApiResult;
    $scope.form = {
      // q: $route.current.params.q
    };
    $scope.meta = {};
    $scope.meta.place = {
      mapsize: 'm',
      mapicon: PlaceService.getPoiDefault().type
    };

    // // Watchers
    // if (Result && Result.data) {
    //   setType(Result.data);
    // }
    // else {
    //   $scope.$watch('form.q', function (q) {
    //     if (!q) return;
    //     if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(q)) {
    //       setType('place');
    //     }
    //     else if (/^https?\:\/\//.test(q)) {
    //       setType('link');
    //       delayScraper.run(function () {
    //         $http.get('/api/scrape', { params: { q: encodeURIComponent(q) } }).success(function (data) {
    //           $scope.form.header = data.title1 || data.title2 || data.title3; //link;
    //           $scope.form.content = '"' + $scope.form.q + '":' + $scope.form.q + '\n\n' + (data.desc1 || data.desc2 || data.desc3);
    //         });
    //       });
    //     }
    //     else {
    //       setType('article');
    //     }
    //   });
    // }
    // 
    $scope.$watch('form.input', function(n, o) {
      if (clickType || n === o) return;
      setContext(n);
    });
    $scope.setContext = function(type) {
      clickType = type;
      setContext(type);
    };

    $scope.submit = function() {
      var obj = fnSave();
      if (!angular.isArray(obj.tags)) obj.tags = obj.tags.split(',');
      // console.log('submit', obj);
      DocumentService.store(obj);
    };
    // $scope.setType = function(type) {
    //   setType(type);
    // };

    if ($route.current.params.new) {
      $scope.form.input = $route.current.params.new;
    }


    function setContext(type) {
      var _meta = $scope.meta;
      console.log('setContext', type, clickType);
      if (_meta.type === clickType) {
        clickType = _meta.type = undefined;
        return;
      }

      switch (type) {
        case 'article':
          _meta.type = 'article';
          break;
        case 'place':
          _meta.type = 'place';
          break;
        case 'link':
          _meta.type = 'link';
          break;
        case 'flight':
          _meta.type = 'flight';
          break;
      }
    }




    function setType(type) {
      function copyMeta() {
        var f = $scope.form;
        return {
          id: id,
          type: _meta.type,
          tags: f.tags||[],
          onlyAuth: f.onlyAuth
        };
      }
      var _meta = $scope.meta;

      if (angular.isObject(type) && type.found) {
        var obj = type.source;
        id = type.id;

        type = type.type;
        $scope.form.tags = obj.tags.join();
        switch(type) {
          case 'article':
            $scope.form.q = obj.header;
            $scope.form.content = obj.content;
            break;
          case 'place':
            $scope.form.q = obj.location.lat + ',' + obj.location.lon;
            $scope.form.header =  obj.header;
            $scope.form.content = obj.content;
            _meta.place.mapicon = PlaceService.getPoi(obj.icon).type;
            break;
          case 'link':
            $scope.form.q = obj.url;
            $scope.form.header =  obj.header;
            $scope.form.content = obj.content;
            break;
        }
      }

      if (_meta.type === type) return false;

      // console.log('setting type', type);
      switch (type) {
        case 'article':
          _meta.type = 'article';
          $scope.preview = true;
          $scope.template = 'html/_new_article.html';
          fnSave = function() {
            var sv = copyMeta();
            sv.header = $scope.form.q;
            sv.content = $scope.form.content;
            return sv;
          };
          return true;
        case 'place':
          _meta.type = 'place';
          $scope.preview = false;
          $scope.template = 'html/_new_place.html';
          fnSave = function() {
            var sv = copyMeta();
            sv.icon = PlaceService.getPoi(_meta.place.mapicon).type;
            sv.header = $scope.form.header;
            sv.content = $scope.form.content;
            var loc = $scope.form.q.split(',');
            sv.location = { lat: loc[0].trim(), lon: loc[1].trim() };
            return sv;
          };
          return true;
        case 'link':
          _meta.type = 'link';
          $scope.preview = true;
          $scope.template = 'html/_new_link.html';
          fnSave = function() {
            var sv = copyMeta();
            sv.url = $scope.form.q;
            sv.header = $scope.form.header;
            sv.content = $scope.form.content;
            return sv;
          };
          return true;
        case 'flight':
          _meta.type = 'flight';
          $scope.preview = false;
          return true;
      }
    }

}]);
