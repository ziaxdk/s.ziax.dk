(function () {
  var fs = require('fs'),
      csv = require("csv-streamify"),
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
    function dobulk(data, done) {
      var bulk = [];
      data.forEach(function(b) {
        var j = JSON.parse(b);
        // bulk.push({ index:  { _index: 'aviation', _type: 'airport', _id: parseInt(j.id) } });
        bulk.push({ index:  { _index: 'aviation', _type: 'airport', _id: j.ident } });
        bulk.push({
          name: j.name,
          ident: j.ident,
          iata: j.iata_code,
          location: [ parseFloat(j.longitude_deg), parseFloat(j.latitude_deg)],
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
    var bulk = bulkstream({ size: 40000 }, dobulk);
    bulk.on('end', function() {
      res.send('ok');
    });

    request('http://www.ourairports.com/data/airports.csv')
      .pipe(csv({objectMode: false, columns: true}))
      .pipe(bulk)
      .pipe(nullstream());
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
