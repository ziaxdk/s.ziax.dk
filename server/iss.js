(function () {

  var fs = require('fs'),
      utils = require('./utils.js'),
      uri = 'http://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html',
      cheerio = require('cheerio'),
      now = new Date(),
      tle = null;

  function getTLE(done) {
    if (new Date() - now < 86400 * 1000 && tle) {
        return done(null, tle);
    }
    
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
    app.get('/api/iss', function (req, res) {
      getTLE(function() {
        res.send(utils.ngSafe(arguments[1]));
      });
    });
  }

  module.exports = {
    routes: routes,
    getTLE: getTLE
  };

}());