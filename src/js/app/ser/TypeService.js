module.service('TypeService', [ 'GPS', 'PlaceService', 'GazService', '$filter',
  function ( GPS, PlaceService, GazService, $filter ) {
  var _types = [
    {
      parser: /undefined/,
      name: undefined
    },
    {
      name: 'flight',
      template: 'html/_new_flight.html',
      preview: true,
      initFn: function(scope) {
        this.airports = [];
        this.mapsize = 'm';
        this.goto = undefined;
      },
      storeFn: function(meta) {
        var _airports = [];
        angular.forEach(meta.airports, function(a) {
          _airports.push({ airport_icao: a.id, airport_iata: a.source.airport_iata, name: a.source.header, location: a.source.location });
        });
        return {
          header: this.input,
          content: this.content,
          date: this.date,
          airports: _airports
        };
      },
      fetchFn: function(data) {
        
      }
    },
    {
      name: 'gaz',
      template: 'html/_new_gaz.html',
      preview: true,
      initFn: function(scope) {
        var _t = this;
        scope.form.purchaseDate = $filter("date")(Date.now(), 'yyyy-MM-dd');
        scope.disable = true;
        GazService.vehicles().then(function(resp) { _t.vehicles = resp.data.hits.hits; scope.form.vehicle = _t.vehicles[0].id; });
      },
      storeFn: function(meta) {
        console.log(this);
        var location = GPS.coords.hasFix ? { lat: GPS.coords.lat, lon: GPS.coords.lon } : { lat: 0, lon: 0 };
        return {
          vehicle: this.vehicle,
          purchaseDateUtc: new Date(this.purchaseDate),
          odometer: this.odometer,
          units: this.units,
          price: this.price,
          station: this.station,
          location: location
        };
      },
      fetchFn: function(data) {
        
      }
    },
    {
      parser: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
      name: 'place',
      template: 'html/_new_place.html',
      preview: true,
      initFn: function() {
        // if (angular.isObject(this.place)) return;
        // console.log('called');
        this.place = {
          mapsize: 'm',
          mapicon: PlaceService.getPoiDefault().type
        };
      },
      storeFn: function(meta) {
        var loc = this.input.split(',');
        return {
          header: this.header,
          content: this.content,
          location: { lat: loc[0].trim(), lon: loc[1].trim() },
          icon: PlaceService.getPoi(meta.place.mapicon).type
        };
      },
      fetchFn: function(data) {
        this.input = data.location.lat + ',' + data.location.lon;
        this.header = data.header;
        this.content = data.content;
      }
    },
    {
      parser: /^https?\:\/\//,
      name: 'link',
      template: 'html/_new_link.html',
      preview: true,
      initFn: angular.noop,
      storeFn: function() {
        return {
          url: this.input,
          header: this.header,
          content: this.content
        };
      },
      fetchFn: function(data) {
        this.input = data.url;
        this.header = data.header;
        this.content = data.content;
      }
    },
    {
      name: 'article',
      template: 'html/_new_article.html',
      preview: true,
      initFn: angular.noop,
      storeFn: function() {
        return {
          header: this.input,
          content: this.content
        };
      },
      fetchFn: function(data) {
        this.input = data.header;
        this.content = data.content;
      }
    }

    // {
    //   name: '_name_',
    //   template: 'html/_new_(name).html',
    //   preview: true,
    //   storeFn: function() {
    //   },
    //   fetchFn: function(data) {
        
    //   }
    // }
  ];

  function types() {
    var _res = [];
    for (var i = _types.length - 1; i >= 0; i--) {
      var _t = _types[i].name;
      if (_t) _res.push(_t);
    }
    return _res;
  }

  function getType (name) {
    for (var i = _types.length - 1; i >= 0; i--) {
      if (_types[i].name === name) return _types[i];
    }
  }
  return {
    getType: getType,
    types: types
  };
}]);
