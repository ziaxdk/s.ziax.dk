var deepExtend = require('deep-extend'),
    Q = require('q'),
    gazValidator = require('amanda')('json'),
    async = require('async'),
    _ = require('lodash'),
    utils = require('./utils.js'),
    es = require('./es.js');

function routes(app) {
  app.post('/api/stations_near', function(req) {
    es.client.search({
      index: 'gaz',
      type: 'station',
      body: {
        "query":
          {
              "filtered" : {
                  "query" : {
                      "match_all" : {}
                  },
                  "filter" : {
                      "geo_distance" : {
                          "distance" : "20km",
                          "location" : {
                              "lat" : req.body.lat,
                              "lon" : req.body.lon
                          }
                      }
                  }
              }
          },
          "sort" : [
              {
                  "_geo_distance" : {
                      "location" : {
                          "lat" : req.body.lat,
                          "lon" : req.body.lon
                      },
                      "order" : "asc",
                      "unit" : "km"
                  }
              }
          ],
          "fields": [
             "_source"
          ]
          // "script_fields": {
          //    "distance" : {
          //      "params" : {
          //         "lat" : req.body.lat,
          //         "lon" : req.body.lon
          //      },
          //      "script" : "doc['location'].distanceInKm(lat,lon)"
          //   }
          // }
      }
    }, es.callback(arguments));
  });

  app.post('/api/vehicle/list', utils.ensureAuthenticated, function(req, res) {
    es.client.search({
      index: 'gaz',
      type: 'vehicle',
      body: {
            "filter": {
                "term": {
                   "usedBy": req.user.id
                }
            }
        }
      }, es.callback(arguments));
  });
}

function schema() {
  return {
    type: 'object',
    properties: {
      odometer: {
        required: true,
        type: 'number'
      },
      onlyAuth: {
        required: true,
        type: 'boolean'
      },
      price: {
        required: true,
        type: 'number'
      },
      purchaseDateUtc: {
        required: true,
        type: 'string'
      },
      station: {
        required: true,
        type: 'string'
      },
      tags: {
        // required: true,
        type: 'array'
      },
      units: {
        required: true,
        type: 'number'
      },
      vehicle: {
        required: true,
        type: 'string'
      }
    }
  };
}
// odometer: 1
// onlyAuth: false
// price: 2
// purchaseDateUtc: "2014-06-09"
// station: "r3ExBGGQSkCe0G4Jp82DFg"
// tags: []
// units: 3
// vehicle: "st1100"
// 

function store(req, res, next) {
  var save = req.body;
  async.waterfall(
    [
      // Validate the Gaz object
      function(cb) {
        gazValidator.validate(save, schema(), { singleError: false }, cb);
      },
      // Get station if any
      function(cb) {
        // return cb(null, null, null);
        if (!save.station) return cb(null, null, null);
        es.client.get({ index: 'gaz', type: 'station', id: save.station }, cb);
      },
      function(station, num, cb) {
        if (station) {
          save.station = station._source;
        }
        cb(null);
      },
      // Get the full vehicle object
      function(cb) {
        es.client.get({ index: 'gaz', type: 'vehicle', id: save.vehicle }, cb);
      },
      function(vehicle, num, cb) {
        save.vehicle = vehicle._source;
        delete save.vehicle.usedBy;
        cb(null);
      },
      function(cb) {
        // console.log(save);
        es.client.index({ index: es.index, type: 'gaz', body: save }, cb);
      },
      function(res, num, cb) {
        cb(null, 'ok');
      }

    ],
    function(err, results) {
      if (err) {
        return res.set('Content-Type', 'application/json').status(412).send(utils.ngSafe({errors: err}));
      }
      // console.log(results);
      res.send(results);
  });
}


module.exports = {
  store: store,
  routes: routes
};
