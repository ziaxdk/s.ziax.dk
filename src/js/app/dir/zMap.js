module.directive('zMap', ['$parse', '$location', 'PlaceService', function ($parse, $location, PlaceService) {
  return {
    restrict: 'A',
    // scope: {},
    // priority: 1,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var t = this,
          map = L.map($element[0], { center: [0, 0], zoom: 12 }),
          layer = L.featureGroup().addTo(map);
      L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }).addTo(map);

      t.map = map;

      $scope.$on('$destroy', function() {
        map.remove();
      });

    }],
    link: function(scope, element, attrs) {
    }
  };
}]);

module.directive('zMapMarkers', ['$compile', '$parse', '$rootScope', 'PlaceService', 'LeafletControlsService',
  function ($compile, $parse, $rootScope, PlaceService, LeafletControlsService) {

  return {
    restrict: 'A',
    require: 'zMap',
    // priority: 2,
    // scope: true,
    compile: function() {
      var html = $compile('<div class="leaflet-control-layers z-map-markers">' +
      '</div>'),
          nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            layer = L.featureGroup().addTo(map);

        attrs.$observe('zMapMarkers', function(places) {
          layer.clearLayers();
          angular.forEach(angular.fromJson(places), function(hit) {
            var place = hit.source,
                poi = PlaceService.getPoiDefault(place.icon),
                marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
                  .on('click', function() { $scope.$evalAsync(function() { $location.path('/show/' + hit.type + '/' + encodeURIComponent(hit.id)); }); })
                  .on('mouseover', function() { marker.openPopup(); })
                  .on('mouseout', function() { marker.closePopup(); })
                  .bindPopup(hit.source.header, { closeButton: false })
                  .addTo(layer);
          });
          map.fitBounds(layer.getBounds());
        });

        map.addControl(LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-markers'}));

        scope.$on('$destroy', function() {
          map.removeLayer(layer);
          nScope.$destroy();
        });
      };
    }
  };
}]);

module.directive('zMapSizer', ['$compile', '$parse', '$rootScope', 'LeafletControlsService',
  function ($compile, $parse, $rootScope, LeafletControlsService) {

  return {
    restrict: 'A',
    require: 'zMap',
    // priority: 2,
    // scope: true,
    compile: function() {
      var html = $compile('<div class="leaflet-control-layers z-map-sizer">' +
        '<div class="btn-group" ng-class="groupSize">' +
        '<button ng-repeat="b in buttons" type="button" class="btn" ng-class="{\'btn-primary\': b.key == sizeAct, \'btn-default\': b.key != sizeAct}" ng-click="setSize(b.key)">{{b.val}}</button>' +
        '</div>' +
      '</div>'),
          nScope = $rootScope.$new();
      nScope.buttons = [{key: 's', val: 'Small'}, {key: 'm', val: 'Medium'}, {key: 'l', val: 'Large'}];

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            bigG = $parse(attrs.zMapSizer),
            bigS = bigG.assign;

        nScope.setSize = function(size) {
          nScope.sizeAct = size;
          bigS(scope, size);
        };

        var s = bigG(scope);
        if (s) nScope.sizeAct = s;

        nScope.groupSize = 'btn-group-sm';
        if (attrs.zMapSizerSize) nScope.groupSize = 'btn-group-' + attrs.zMapSizerSize;
        map.addControl(LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-sizer'}));

        scope.$on('$destroy', function() {
          nScope.$destroy();
        });
      };
    }
  };
}]);

module.directive('zMapMarker', ['$compile', '$parse', '$rootScope', 'PlaceService', 'LeafletControlsService',
  function ($compile, $parse, $rootScope, PlaceService, LeafletControlsService) {

  return {
    restrict: 'A',
    require: 'zMap',
    priority: 2,
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          markerG = $parse(attrs.zMapMarker),
          markerS = markerG.assign,
          pos = markerG(scope).split(','),
          layer = L.featureGroup().addTo(map),
          marker = L.marker(pos, {
            draggable: true,
            icon: L.AwesomeMarkers.icon({ icon: 'fa-spinner', markerColor: 'darkpurple', prefix: 'fa' }) })
          .on('drag', function(e) {
            click(e.target);
          })
          .addTo(layer);

      function click(e) {
        var ll = e.latlng||e.getLatLng();
        marker.setLatLng(ll);
        scope.$evalAsync(function () {
          markerS(scope, ll.lat.toFixed(4) + ',' + ll.lng.toFixed(4));
        });
      }

      map.on('click', click);
      map.setView(pos);

      attrs.$observe('zMapMarkerIcon', function (val) {
        if (!val) return;
        var poi = PlaceService.getPoi(val);
        marker.setIcon(L.AwesomeMarkers.icon({ icon: 'fa-' + poi.name, markerColor: poi.color, prefix: 'fa' }));
      });
      scope.$on('$destroy', function() {
        map.off('click', click);
        map.removeLayer(layer);
      });
    }
  };
}]);
module.directive('zMapControl', ['$compile', '$rootScope', 'LeafletControlsService',
  function ($compile, $rootScope, LeafletControlsService) {
  
  return {
    restrict: 'A',
    require: 'zMap',
    compile: function() {
      var html = $compile('<div class="leaflet-control-layers z-map-tags-control"><div class="list-group"><a ng-class="{active: tag.selected}" href="javascript:;" ng-click="facet(tag)" ng-repeat="tag in tags track by tag.term" class="list-group-item"><span class="badge">{{tag.count}}</span>{{tag.term}}</a></div></div>'),
          nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map;
        nScope.tags = [];

        nScope.facet = function(hit) {
          scope.$eval(attrs.zMapControlCb, {hit: hit});
        };

        scope.$watch(function () { return scope.$eval(attrs.zMapControl); }, function (value) {
          nScope.tags = value;
        });
        
        map.addControl(LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-tags-select', position: 'bottomright'}));
        scope.$on('$destroy', function() {
          nScope.$destroy();
        });
      };
    }
  };
}]);
