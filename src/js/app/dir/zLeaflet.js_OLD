// module.directive('zLeaflet', ['$parse', '$location', 'PlaceService', function ($parse, $location, PlaceService) {
//   return {
//     restrict: 'A',
//     link: function(scope, element, attrs) {
//       var map = L.map(element[0], { center: [0, 0], zoom: 12 }),
//           iconsGet = $parse(attrs.zLeaflet),
//           layer = L.featureGroup().addTo(map),
//           bounds = [];
//       L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }).addTo(map);
//       // leafletMarker.addTo(layer);


//       // L.ziax.tagsSelector(scope).addTo(map);

//       angular.forEach(iconsGet(scope), function(hit) {
//         var place = hit.source,
//             poi = PlaceService.getPoiDefault(place.icon),
//             marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
//         .on('click', function() {
//           scope.$apply(function() {
//             $location.path('/show/' + hit.type + '/' + encodeURIComponent(hit.id));
//           });
//         }).on('mouseover', function() {
//           marker.openPopup();
//         }).on('mouseout', function() {
//           marker.closePopup();
//         }).bindPopup(hit.source.header, { closeButton: false }).addTo(map);
//         bounds.push(L.latLng(place.location));
//       });

//       map.fitBounds(L.latLngBounds(bounds));
//       // map.panInsideBounds(L.latLngBounds(bounds), { maxZoom: 5 });

//       // http://localhost:8081/#/show/place/hiTP47HKRmqynG2JoUqCTw

//       // scope.$watch(function () { return scope.$eval(attrs.dashLeaflet) }, function (value) {
//       //   if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
//       //     latlon = value.split(',');
//       //     leafletMarker.setLatLng(latlon);
//       //     map.setView(latlon);
//       // }});

//       // attrs.$observe('dashLeafletIcon', function (val) {
//       //   if (!val) return;
//       //   var poi = PlaceService.getPoi(val)
//       //   leafletMarker.setIcon(L.AwesomeMarkers.icon({ icon: 'fa-' + poi.name, markerColor: poi.color, prefix: 'fa' }));
//       // });

//       scope.$on('$destroy', function() {
//           map.remove();
//       });
//     }
//   };
// }]);
