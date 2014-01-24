(function () {
  var utils = require('./utils.js')
    , elasticsearch = require('elasticsearch')
    , Config = require('./../_config.json')
    , client = elasticsearch.createClient(process.env.NODE_ENV === 'production' ? Config.es.production : Config.es.development)
    , types = ['link', 'place', 'article']
    , index = 'ziax';



  function routes(app) {
    app.get('/api/me', utils.ensureAuthenticated, function (req, res) {
      res.send(utils.ngSafe(req.user));
    });

    app.get('/api/history', function () {
      client.search({_index: index}, {
        facets: {
          history: {
            terms: {
              field: "q2.facet"
            }
          }
        },
        size: 0
      }, callback(arguments));
    });
  }

  function callback (args) {
    return function (err, data) {
      if (err) {
        console.log(err);
        return args[2](err);
      }
      args[1].contentType('application/json');
      args[1].send(utils.ngSafe(data));
    };
  }

  module.exports = {
    routes: routes,
    client: client,
    callback: callback,
    types: types,
    index: index

  };
}());

  // // var Scraper = require('./server/server-scrape-dev.js');
  // var Scraper = require('./server/server-scrape-prod.js');
  // es = elasticsearch.createClient(Config.es.development);
  // // core = require('./server/server-core.js')(es, app);
  // var esobj = require('./server/setup-es')(es, app);
  // app.get('/api/scrape', Scraper.scrape);
  // sio.set('transports', ['websocket']);
  // sio.set('log level', 0);
  // require('./server/socketio.js')(sio, esobj.esdocument);
  // // app.use(function (err, req, res, next) {
  // //   console.log('err', err);
  // //   res.send("OK");

  // // });
