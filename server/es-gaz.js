var deepExtend = require('deep-extend'),
    Q = require('q'),
    gazValidator = require('amanda')('json'),
    async = require('async'),
    _ = require('lodash'),
    utils = require('./utils.js'),
    es = require('./es.js');

function routes(app) {
  app.post('/api/stations_near', utils.ensureAuthenticated, function(req) {
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
                          "distance" : "500km",
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

  /**
   * Gets the vehicle list on the authenticated user
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
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

  app.get('/api/gaz', utils.ensureAuthenticated, function(req, res) {
    es.client.get({ index: 'ziax', type: 'gaz', id: req.query.id }, es.callback(arguments));
  });

  app.get('/api/gaz/list', utils.ensureAuthenticated, function(req, res) {
    es.client.search({
      index: 'ziax',
      type: 'gaz',
      body: {
              "from": req.query.offset || 0,
              "sort": [
                 {
                    "purchaseDateUtc": {
                       "order": "desc"
                    }
                 }
              ]
      }
      }, es.callback(arguments));
  });

  app.delete('/api/gaz', utils.ensureAdminAuthenticated, function(req, res) {
    es.client.delete({
      index: 'ziax',
      type: 'gaz',
      id: req.query.id
    }, es.callback(arguments));
  });


  app.get('/api/gaz/stat', function(req, res) {
    var vehicle = req.query.vehicle || 'st1100';

    es.client.search({
      index: 'ziax',
      type: 'gaz',
      searchType: 'count',
      body: {
        "query": {
          "filtered": {
            "query": {
              "match_all": {}
            },
            "filter": {
              "bool": {
                "must": [
                  {
                    "term": {
                      "vehicle._id": vehicle
                    }
                  },
                  {
                    "range": {
                      "purchaseDateUtc": {
                        "from": "now-10y",
                        "to": "now"
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        "aggs": {
          "vehicle": {
            "terms": {
              "field": "vehicle._id"
            },
            "aggs": {
              "per_month": {
                "date_histogram": {
                  "field": "purchaseDateUtc",
                  "interval": "month"
                },
                "aggs": {
                  "units": {
                    "sum": {
                      "field": "units"
                    }
                  },
                  "total_price": {
                    "sum": {
                      "script": "doc['units'].value * doc['price'].value"
                    }
                  },
                  "avg_dist": {
                    "avg": {
                      "script": "((doc['nextOdometer'].value - doc['odometer'].value) / doc['units'].value)"
                    }
                  }
                }
              }
            }
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
      /**
       * Validate the Gaz object
       * @param  {Function} cb async callback
       * @return {void}
       */
      function(cb) {
        gazValidator.validate(save, schema(), { singleError: false }, cb);
      },

      /**
       * Get the station (if any) and the full vehicle 
       */
      function(cb) {
        var mgetDocs = [
          { _index: 'gaz', _type: 'vehicle', _id: save.vehicle }
        ];
        if (save.station) {
          mgetDocs.push({ _index: 'gaz', _type: 'station', _id: save.station });
        }
        es.client.mget({ body: { docs: mgetDocs } }, cb);
      },
      function(mget, num, cb) {
        var vehicleId = save.vehicle,
            vehicle = mget.docs[0], // vehicle
            station = mget.docs[1]; // station

        save.vehicle = vehicle._source;
        save.vehicle._id = vehicleId;
        delete save.vehicle.usedBy;

        if (station) {
          save.station = station._source;
        }
        cb(null);
      },

      /**
       * Gets the previous odometer
       */
      function(cb) {
        es.client.search({ index: 'ziax', type: 'gaz', body: {
          "query": {
            "filtered": {
              "query": {
                "match_all": {}
              },
              "filter": {
                "term": {
                  "vehicle._id": save.vehicle._id
                }
              }
            }
          },
          "sort": [
            {
              "odometer": {
                "order": "desc"
              }
            }
          ],
          "size": 1,
          "fields": ["id"]
        }}, cb);
      },
      function(hits, num, cb) {
        var len = hits.hits.hits.length;
        if(len === 1) {
          es.client.update({ index: 'ziax', type: 'gaz', id: hits.hits.hits[0]._id, body: {
            doc: {
              nextOdometer: save.odometer
            }
          }}, cb);
        } else {
          cb('previous fetch was length ' + len);
        }
      },

      /**
       * Save the new gaz type
       */
      function(hits, num, cb) {
        save.nextOdometer = 999999;
        /**
         * Enable for debugging
         */
        // console.log(save);
        // return cb(null, null, null);
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
