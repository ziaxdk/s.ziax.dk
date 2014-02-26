(function () {

  var fs = require('fs'),
      utils = require('./utils.js'),
      uri = 'http://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html',
      cheerio = require('cheerio'),
      now = new Date(),
      es = require('./es.js'),
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

  function routes(app) {
    app.get('/api/iss', function(req, res) {
        es.client.get({
          index: 'core',
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
          index: 'core',
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
    routes: routes
  };

}());