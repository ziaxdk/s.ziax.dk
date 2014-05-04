module.directive('zMap', ['$parse', '$location', 'PlaceService', function ($parse, $location, PlaceService) {
  return {
    restrict: 'A',
    // scope: {},
    // priority: 1000,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var t = this,
          map = L.map($element[0], { center: [0, 0], zoom: 12 }),
          base0 = L.tileLayer('https://{s}.tiles.mapbox.com/v3/ziaxdk.h6efc5a4/{z}/{x}/{y}.png', { attribution: '' }).addTo(map),
          base1 = L.tileLayer("http://{s}.tile.cloudmade.com/7900B8C7F3074FD18E325AD6A60C33B7/997/256/{z}/{x}/{y}.png",{ attribution:'' }),
          base2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '' }),
          base3 = L.bingLayer("Alv2HutsIUPb_D2Jz0KdN37XixBdCph40lz8uMUNyUM2yp3IPg0oaiHn-J0ieMU4");
          chooser = L.control.layers({ 'Mapbox': base0, 'Basic': base2, 'Bing': base3, 'Deprecate': base1 }, {}, { position: 'bottomleft' }).addTo(map);

      t.map = map;
      t.chooser = chooser;

      $scope.$on('$destroy', function() {
        map.remove();
      });

    }],
    link: function(scope, element, attrs) {
    }
  };
}]);

module.directive('zMapMarkers', ['$compile', '$rootScope', '$location', 'PlaceService',
  function ($compile, $rootScope, $location, PlaceService) {

  return {
    restrict: 'A',
    require: 'zMap',
    // priority: 2,
    // scope: true,
    compile: function() {
      var nScope = $rootScope.$new();

      return function link(scope, element, attrs, zmap) {
        var map = zmap.map,
            chooser = zmap.chooser,
            layers = L.featureGroup().addTo(map);

        attrs.$observe('zMapMarkers', function(places) {
          layers.clearLayers();
          angular.forEach(angular.fromJson(places), function(hit) {
            var place = hit.source,
                poi = PlaceService.getPoiDefault(place.icon),
                marker = L.marker(place.location, { icon: L.AwesomeMarkers.icon({ icon: 'fa-' + poi.type, markerColor: poi.color, prefix: 'fa' }) })
                  .on('click', function() { scope.$evalAsync(function() { $location.path('/show/' + hit.type + '/' + encodeURIComponent(hit.id)); }); })
                  .on('mouseover', function() { marker.openPopup(); })
                  .on('mouseout', function() { marker.closePopup(); })
                  .bindPopup(hit.source.header, { closeButton: false })
                  .addTo(layers);

          });
          map.fitBounds(layers.getBounds());
        });

        chooser.addOverlay(layers, 'Places');

        scope.$on('$destroy', function() {
          chooser.removeLayer(layers);
          map.removeLayer(layers);
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
            bigS = bigG.assign,
            control = LeafletControlsService.leafletControl({html: html, scope: nScope, className: 'z-map-sizer'});

        nScope.setSize = function(size) {
          // console.log('setSize', size);
          nScope.sizeAct = size;
          bigS(scope, size);
        };

        var s = bigG(scope);
        if (s) nScope.sizeAct = s;

        nScope.groupSize = 'btn-group-sm';
        if (attrs.zMapSizerSize) nScope.groupSize = 'btn-group-' + attrs.zMapSizerSize;
        map.addControl(control);

        scope.$on('$destroy', function() {
          nScope.$destroy();
          map.removeControl(control);
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
          pos = [0 ,0],
          layer = L.featureGroup().addTo(map),
          marker = L.marker(pos, {
            draggable: true,
            icon: L.AwesomeMarkers.icon({ icon: 'fa-spinner', markerColor: 'darkpurple', prefix: 'fa' }) })
          .on('drag', function(e) {
            click(e.target);
          })
          .addTo(layer);

      scope.$watch(function() { return markerG(scope); }, function(val) {
        if (!val || !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(val)) return;
        var pos = val.split(',');
        if (!angular.isArray(pos) || pos.length !== 2) return;
        marker.setLatLng(pos);
        map.panTo(pos);
      });

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
module.directive('zMapTagsControl', ['$compile', '$rootScope', 'LeafletControlsService',
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
          scope.$eval(attrs.zMapTagsControlCb, {hit: hit});
        };

        scope.$watch(function () { return scope.$eval(attrs.zMapTagsControl); }, function (value) {
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
module.directive('zMapIss2', ['$http', '$timeout', function ($http, $timeout) {
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup(),
          path = null,
          iss = L.marker([0, 0]).addTo(layer),
          uri = 'http://api.open-notify.org/iss-now.json?callback=JSON_CALLBACK',
          run = null,
          cancel = true;

      function grab() {
        if (cancel) return;
        $http.jsonp(uri).success(function(data) {
          add(data.iss_position);
          if (cancel) return;
          run = $timeout(grab, 1000);
        });
      }

      function add(ll) {
        // console.log('open', ll.latitude, ll.longitude);
        var pos = L.latLng(ll.latitude, ll.longitude);
        iss.setLatLng(pos);
        if (!path) {
          path = L.polyline([pos], { color: 'red', noClip: true }).addTo(layer);
        } else {
          path.addLatLng(pos);
        }
      }

      function enable(e) {
        if (e && e.layer == layer) {
          cancel = false;
          grab();
        }
      }
      function disable(e) {
        if (e && e.layer == layer) {
          cancel = true;
        }
      }
      chooser.addOverlay(layer, 'ISS (old)???');
      map.on('overlayadd', enable);
      map.on('overlayremove', disable);
      scope.$on('$destroy', function() {
        disable();
        map.off('overlayadd', enable);
        map.off('overlayremove', disable);
        chooser.removeLayer(layer);
        map.removeLayer(layer);
      });
      // grab();
    }
  };
}]);
module.directive('zMapIss', ['$http', '$timeout', '$interval', '$parse', function ($http, $timeout, $interval, $parse) {
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup().addTo(map),
          path = null,
          run = null,
          iss = L.marker([0, 0]).addTo(layer),
          tle_line_1 = "1 25544U 98067A   14050.52955885  .00016717  00000-0  10270-3 0  9004",
          tle_line_2 = "2 25544  51.6500 322.8568 0003647 155.3472 204.7854 15.50497588 33075";

      $http.get('/api/iss').then(startCalc, startCalc);

      function startCalc(data) {
        if (data) {
          tle_line_1 = data.data.tle[0];
          tle_line_2 = data.data.tle[1];
        }
        run = $interval(calc, 1000);
        calc();
      }

      // 20-02-2014
      // Lib: https://github.com/shashwatak/satellite-js
      function calc() {
        var satrec = satellite.twoline2satrec (tle_line_1, tle_line_2);
        var date = new Date();
        var position_and_velocity = satellite.propagate (satrec, date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        var position_eci = position_and_velocity["position"];
        // var velocity_eci = position_and_velocity["velocity"];
        var gmst = satellite.gstime_from_date (date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        var position_gd    = satellite.eci_to_geodetic (position_eci, gmst);
        var longitude = position_gd["longitude"];
        var latitude  = position_gd["latitude"];
        var longitude_str = satellite.degrees_long (longitude);
        var latitude_str  = satellite.degrees_lat  (latitude);
        var pos = L.latLng(latitude_str, longitude_str);
        iss.setLatLng(pos);
        if (!path) {
          path = L.polyline([pos], { color: 'red', noClip: true }).addTo(layer);
        } else {
          path.addLatLng(pos);
        }
      }

      chooser.addOverlay(layer, 'ISS???');
      scope.$on('$destroy', function() {
        chooser.removeLayer(layer);
        map.removeLayer(layer);
        $interval.cancel(run);
      });
    }
  };
}]);
module.directive('zMapFlights', ['$parse',
  function ($parse) {
  
  return {
    restrict: 'A',
    require: 'zMap',
    link: function(scope, element, attrs, zmap) {
      var map = zmap.map,
          chooser = zmap.chooser,
          layer = L.featureGroup().addTo(map),
          markers = L.featureGroup().addTo(layer),
          path = L.polyline([], { color: 'blue' }).addTo(layer);

      // attrs.$observe('zMapFlights', function(v) {
      //   v = $parse(v)(scope);
      //   if (!v || !angular.isArray(v)) return;
      //   markers.clearLayers();
      //   path.setLatLngs([]);
      //   angular.forEach(v, function(p) {
      //     var ll = L.latLng([p.location[1], p.location[0]]);
      //     L.marker(ll).addTo(markers);
      //     path.addLatLng(ll);
      //   });
      //   if (v.length > 1)
      //     map.fitBounds(layer.getBounds());
      // });
      chooser.addOverlay(layer, 'Flights');
      scope.$on('$destroy', function() {
        chooser.removeLayer(layer);
        map.removeLayer(layer);
      });
    }
  };
}]);
