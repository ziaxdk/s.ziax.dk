module.directive('dashLeaflet', ['$parse', 'PlaceService', function ($parse, PlaceService) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var map = L.map(element[0], { center: [0, 0], zoom: 12 }),
          bigMapGet = $parse(attrs.dashLeafletBig),
          bigMapSet = bigMapGet.assign,
          bigMapEnabled = bigMapGet(scope),
          latLonGet = $parse(attrs.dashLeaflet),
          latLonSet = latLonGet.assign,
          latlon = [0, 0],
          leafletMarker = L.marker(latlon, { draggable: true, icon: L.AwesomeMarkers.icon({ icon: 'fa-spinner', markerColor: 'darkpurple', prefix: 'fa' }) });

      // <!-- 'red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue' -->
      leafletMarker.on('dragend', function (evt) {
        var ll = this.getLatLng();
        scope.$evalAsync(function () {
          latLonSet(scope, ll.lat.toFixed(4) + ',' + ll.lng.toFixed(4));
        });
      });
      if (attrs.dashLeafletReadonly && attrs.dashLeafletReadonly === 'true') {
        leafletMarker.options.draggable = false;
      }

      var layer = L.featureGroup().addTo(map);
      L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }).addTo(map);
      leafletMarker.addTo(layer);


      if (angular.isDefined(bigMapEnabled) && typeof bigMapEnabled === 'boolean') {
        var MyControl = L.Control.extend({
            options: {
                position: 'topright'
            },

            onAdd: function (map) {
                // create the control container with a particular class name
                var container = L.DomUtil.create('div', 'my-custom-control');
                container.setAttribute('aria-haspopup', true);

                var link = L.DomUtil.create('a', 'dash-control-big', container);
                link.href = 'javascript:;';
                link.title = "Upscale";
                link.innerText = 'X';

                L.DomEvent
                  .on(link, 'click', function () {
                    scope.$evalAsync(function () {
                      bigMapSet(scope, !bigMapEnabled);
                    });
                  });
                return container;
            }
        });
        map.addControl(new MyControl());
      }

      scope.$watch(function () { return scope.$eval(attrs.dashLeaflet); }, function (value) {
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
          latlon = value.split(',');
          leafletMarker.setLatLng(latlon);
          map.setView(latlon);
      }});

      attrs.$observe('dashLeafletIcon', function (val) {
        if (!val) return;
        var poi = PlaceService.getPoi(val);
        leafletMarker.setIcon(L.AwesomeMarkers.icon({ icon: 'fa-' + poi.name, markerColor: poi.color, prefix: 'fa' }));
      });

      scope.$on('$destroy', function() {
        map.remove();
      });
    }
  };
}]);
