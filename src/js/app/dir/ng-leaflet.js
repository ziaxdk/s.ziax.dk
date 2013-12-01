module.directive('dashLeaflet', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var map = L.map(element[0], {
        center: [0, 0],
        zoom: 12
      });
      L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{
        attribution:''
      }).addTo(map);

      var bigMapGet = $parse(attrs.dashLeafletBig);
      var bigMapSet = bigMapGet.assign;


      var v = bigMapGet(scope);
      if (angular.isDefined(v) && typeof v === 'boolean') {

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
                    var v = bigMapGet(scope);
                    scope.$evalAsync(function () {
                      bigMapSet(scope, !v);
                    });
                  });

                return container;
            }
        });

        map.addControl(new MyControl());
      }



      var layer = L.featureGroup().addTo(map);

      var latLonGet = $parse(attrs.dashLeaflet);
      var latLonSet = latLonGet.assign;


      scope.$watch(function () {
        return scope.$eval(attrs.dashLeaflet);
      }, function (value) {
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
          var latlon = value.split(',');
          layer.clearLayers();
          L.marker(latlon, { draggable: true })
            .on('dragend', function (evt) {
              var ll = this.getLatLng();
              scope.$evalAsync(function () {
                latLonSet(scope, ll.lat.toFixed(4) + ',' + ll.lng.toFixed(4));
              })
              // scope.$apply(function () {
              //   latLonSet(scope, ll.lat.toFixed(4) + ',' + ll.lng.toFixed(4));
              // });
            })
            .addTo(layer);
          map.setView(latlon);
        }
      });




    }
  }; 
}]);
