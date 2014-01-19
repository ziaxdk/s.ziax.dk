(function () {
  var es = require('./es.js')
    // , sio = require('./socketio.js')
    , _ = require('lodash')
    , utils = require('./utils')
    , Q = require('q');

  function count() {
    var d = Q.defer();
    es.client.count({ _index: es.index, _type: es.types.join() }, undefined, function (err, data) { 
      if (err) return d.reject(err);
      return d.resolve(data);
    });
    return d.promise;
  }


  function routes(app) {
    app.get('/api/drive', function () {
      es.client.count({ _index: es.index, _type: es.types.join() }, undefined, es.callback(arguments));
    });

    app.post('/api/document', utils.ensureAuthenticated, function (req, res) {
      var save,
          src = req.body,
          ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      save = {
        header: src.header,
        content: src.content,
        tags: src.tags,
        createdutc: new Date(),
        clicks: 0,
        ip: ip,
        onlyAuth: src.onlyAuth

      };
      switch(src.type) {
        case 'link': {
          save.url = src.url;
          break;
        }
        case 'place': {
          save.icon = src.icon;
          if (_.isObject(src.location)) {
            save.location = src.location;
          }
          else {
            var latlon = src.location.split(',');
            save.location = { lat: latlon[0].trim(), lon: latlon[1].trim() };
          }
        }
      }

      // console.log(save);
      // res.send("ok");
      es.client.index({ _index: es.index, _type: src.type }, save, es.callback(arguments));
    });
  }

  module.exports = {
    routes: routes,
    count: count
  }

}());
