(function () {
  var es = require('./es.js'),
    _ = require('lodash'),
    utils = require('./utils'),
    Q = require('q');

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
  }

  module.exports = {
    routes: routes
  };

}());
