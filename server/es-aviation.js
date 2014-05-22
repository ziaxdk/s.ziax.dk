(function () {
  var fs = require('fs'),
      csv = require("csv-streamify"),
      ASync = require('async'),
      utils = require('./utils.js'),
      bulkstream = require('./bulk-stream.js'),
      nullstream = require('./null-stream.js'),
      uri = 'http://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html',
      cheerio = require('cheerio'),
      now = new Date(),
      es = require('./es.js'),
      _ = require('lodash'),
      Q = require('q'),
      request = require('request'),
      tle = null;


  function getTLE(done) {
    console.log('fetching...');
    utils.fetchUri(uri)
      .then(function(body) {

        var $ = cheerio.load(body);
        var text = $('pre').text();
        var pos = text.indexOf('TWO LINE MEAN ELEMENT SET');
        text = text.substr(pos, 300);
        pos = text.indexOf('ISS');
        text = text.substr(pos, 200).split('\n');

        tle = [ text[1].trim(), text[2].trim() ];
        done(null, tle);
      });
  }


  function fetchAirports(req, res) {

    function _fetchCountries(done) {
      var _countryObj = {};
      var bulk = bulkstream({ size: 40000 }, createCountries);
      bulk.on('end', function() {
        done(null, _countryObj);
      });

      request('http://ourairports.com/data/countries.csv')
        .pipe(csv({objectMode: false, columns: true}))
        .pipe(bulk)
        .pipe(nullstream());

      function createCountries(data, done) {
        data.forEach(function(b) {
          var c = JSON.parse(b);
          if (_countryObj[c.code]) throw "exists";
          _countryObj[c.code] = c;
        });
        done();
      }
    }
    function _fetchAirports(country, done) {
      var bulk = bulkstream({ size: 40000 }, dobulk);
      bulk.on('end', function() {
        done();
      });

      function dobulk(data, done) {
        var bulk = [];
        data.forEach(function(b) {
          var j = JSON.parse(b);
          // bulk.push({ index:  { _index: 'aviation', _type: 'airport', _id: parseInt(j.id) } });
          bulk.push({ index:  { _index: 'aviation', _type: 'airport', _id: j.ident } });
          // bulk.push({ index:  { _index: 'ziax', _type: 'airport', _id: j.ident } });
          bulk.push({
            header: j.name,
            airport_ident: j.ident,
            airport_iata: j.iata_code,
            location: {
              lat: parseFloat(j.latitude_deg),
              lon: parseFloat(j.longitude_deg)
            },
            country: country[j.iso_country].name,
            onlyAuth: false,
            clicks: 0,
            createdutc: new Date(),
            suggest: {
              input: [ j.ident, j.name ],
              output: j.name
            }
          });
        });

        es.client.bulk({ body: bulk }, function(err, response, status) {
          if (err) done(err);
          done();
        });
      }

      request('http://www.ourairports.com/data/airports.csv')
        .pipe(csv({objectMode: false, columns: true}))
        .pipe(bulk)
        .pipe(nullstream());
    }
       
    ASync.waterfall([_fetchCountries, _fetchAirports], function(err, results) {
      if (err) res.send(err);
      res.send('ok');
    });
    }
  function routes(app) {
    app.get('/api/airport', function(req) {
      es.client.mget({
        index: 'aviation',
        type: 'airport',
        body:{
          ids: _.isArray(req.query.code) ? req.query.code : [req.query.code]
        }
      }, es.callback(arguments));
    });

    app.put('/api/airport', fetchAirports);

    app.post('/api/airport', function(req, res) {
      var q = req.body.q;
      es.client.search({
        index: 'aviation',
        type: 'airport',
        body: {
          "query": {
              "match_all": {}
          },
          "filter": {
              "or": {
                 "filters": [
                      {
                          "prefix": {
                              "airport_iata": q.toUpperCase()
                          }
                      },
                      {
                          "prefix": {
                              "airport_ident": q.toUpperCase()
                          }
                      },
                      {
                          "term": {
                             "country": q
                          }
                      },
                      {
                          "term": {
                             "header": q
                          }
                      }
                 ]
              }
          }
        }
      }, es.callback(arguments));
    });


    // ISS
    app.get('/api/iss', function(req, res) {
        es.client.get({
          index: 'aviation',
          type: 'iss',
          id: 'iss'
        }, function(err, resp) {
          if (err) throw err;
          res.send(utils.ngSafe(resp._source));
        });
    });

    app.put('/api/iss', function (req, res) {
      getTLE(function(err, resp) {
        es.client.index({
          index: 'aviation',
          type: 'iss',
          id: 'iss',
          body: {
            tle: resp,
            createdutc: new Date()
          }
        }, function(err, resp) {
          if (err) throw err;
          res.send("ok");
        });
      });
    });
  }

  module.exports = {
    routes: routes,
    fetchAirports: fetchAirports
  };

}());
