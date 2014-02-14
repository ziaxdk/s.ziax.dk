(function () {
  var es = require('./es.js')
    // , sio = require('./socketio.js')
    , _ = require('lodash')
    , utils = require('./utils')
    , Q = require('q');

  function count() {
    return es.client.count({
      index: es.index,
      type: es.types
    });
  }



  function routes(app) {
    // app.get('/api/drive', function () {
    //   es.client.count({ index: es.index, type: es.types }, es.callback(arguments));
    //   // es.client.count({ _index: es.index, _type: es.types.join() }, undefined, es.callback(arguments));
    // });

    app.post('/api/star', function(req) {
      es.client.update({
        index: es.index,
        type: req.body.type,
        id: req.body.id,
        body: {
           doc: { "star" : req.body.val }
        }
      }, es.callback(arguments));
    });

    app.get('/api/tags', function() {
      es.client.search({
        index: es.index,
        type: es.types,
        searchType: 'count',
        body: {
        "facets": {
           "tags": {
              "terms": {
                 "field": "tags",
                 "size": 2147483647,
                 "order": "term"
              }
           }
        }
      } }, es.callback(arguments));
    });

    app.put('/api/document', utils.ensureAuthenticated, function (req, res) {
      var save,
          src = req.body,
          ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      save = {
        header: src.header,
        content: src.content,
        tags: src.tags,
        ip: ip,
        onlyAuth: src.onlyAuth
      };
      switch(src.type) {
        case 'link':
          save.url = src.url;
          break;
        case 'place':
          save.icon = src.icon;
          if (_.isObject(src.location)) {
            save.location = src.location;
          }
          else {
            var latlon = src.location.split(',');
            save.location = { lat: latlon[0].trim(), lon: latlon[1].trim() };
          }
      }
      es.client.update({
        index: es.index,
        type: src.type,
        id: src.id,
        body: {
          doc: save
        }
      }, es.callback(arguments));
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
        case 'link':
          save.url = src.url;
          break;
        case 'place':
          save.icon = src.icon;
          if (_.isObject(src.location)) {
            save.location = src.location;
          }
          else {
            var latlon = src.location.split(',');
            save.location = { lat: latlon[0].trim(), lon: latlon[1].trim() };
          }
      }

      // console.log(save, src.id);
      // res.send("ok");
      // return;
      // es.client.index({ _index: es.index, _type: src.type }, save, es.callback(arguments)); // OLD
      es.client.index({
        index: es.index,
        type: src.type,
        body: save
      }, es.callback(arguments));
    });
  }

  module.exports = {
    routes: routes,
    count: count
  };

}());
