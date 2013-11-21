module.directive('dashLeaflet', [function () {
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
      var layer = L.featureGroup().addTo(map);


      scope.$watch(function () {
        return scope.$eval(attrs.dashLeaflet);
      }, function (value) {
        if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
          var latlon = value.split(',');
          layer.clearLayers();
          L.marker(latlon).addTo(layer);
          map.setView(latlon);
        }
      });




    }
  }; 
}]);
