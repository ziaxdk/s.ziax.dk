(function () {
  module.exports = function (esClient, app) {
    var esCommon = require('./es-common'),
        _ = require('underscore'),
        utils = require('./utils2');


    app.get('/api/drive', function () {
      esClient.count({ _index: esCommon.index, _type: esCommon.types.join() }, undefined, esCommon.callback(arguments));
    });

    app.post('/api/document', utils.ensureAuthenticated, function (req, res) {
      res.status(500);
      res.send('fina');
    });


    app.post('/api/drive', utils.ensureAuthenticated, function (req, res) {
      var save,
          src = req.body,
          ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      // if (!utils.validateCode(src.code)) {
      //   res.send("err validateCode");
      //   return;
      // }
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

  };
}())