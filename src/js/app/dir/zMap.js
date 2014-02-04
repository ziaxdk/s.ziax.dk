module.directive('zMap', ['$parse', '$location', 'PlaceService', function ($parse, $location, PlaceService) {
  return {
    restrict: 'A',
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var t = this,
          map = L.map($element[0], { center: [0, 0], zoom: 12 }),
          layer = L.featureGroup().addTo(map);
      L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }).addTo(map);

      t.map = map;

      $scope.$on('$destroy', function() {
        map.remove();
      });

      $scope.$watch(function () { return $scope.$eval($attrs.zMap); }, function (values) {
        layer.clearLayers();
        angular.forEach(values, function(value) {
          var place = value.source,
              poi = PlaceService.getPoiDefault(place.icon),
              marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
                .on('click', function() { $scope.$evalAsync(function() { $location.path('/show/' + value.type + '/' + encodeURIComponent(value.id)); }); })
                .on('mouseover', function() { marker.openPopup(); })
                .on('mouseout', function() { marker.closePopup(); })
                .bindPopup(value.source.header, { closeButton: false })
                .addTo(layer);
        });
        map.fitBounds(layer.getBounds());
      });
    }],
    link: function(scope, element, attrs) {
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
        nScope.tags = [];

        nScope.facet = function(hit) {
          scope.$eval(attrs.zMapControlCb, {hit: hit});
        };

        scope.$watch(function () { return scope.$eval(attrs.zMapControl); }, function (value) {
          nScope.tags = value;
        });
        
        zmap.map.addControl(LeafletControlsService.tagsControl({html: html, scope: nScope}));
      };
    }
  };
}]);
