(function () {
  module.exports = function (esClient, app) {
    var esCommon = require('./es-common')
        , _ = require('underscore')
        , utils = require('./utils2')
        , sio = require('./socketio.js')
        , Q = require('q');

    function count() {
      var d = Q.defer();
      esClient.count({ _index: esCommon.index, _type: esCommon.types.join() }, undefined, function (err, data) { 
        if (err) return d.reject(err);
        return d.resolve(data);
      });
      return d.promise;
    }


    app.get('/api/drive', function () {
      esClient.count({ _index: esCommon.index, _type: esCommon.types.join() }, undefined, esCommon.callback(arguments));
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
      esClient.index({ _index: esCommon.index, _type: src.type }, save, esCommon.callback(arguments));
    });

    return {
      count: count
    }

  };
}())