var deepExtend = require('deep-extend'),
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


function store(req, res, next) {
  var save = req.body;

  async.waterfall(
    [
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
      if (err) return next(err);
      // console.log(results);
      res.send(results);
  });
}


module.exports = {
  store: store,
  routes: routes
};
