(function () {
  var es = require('./es.js'),
    _ = require('lodash'),
    utils = require('./utils'),
    Q = require('q');

  function routes(app) {
    app.get('/api/airport', function(req) {
      es.client.get({
        index: 'aviation',
        type: 'airport',
        id: req.query.code
      }, es.callback(arguments));
    });
  }

  module.exports = {
    routes: routes
  };

}());
