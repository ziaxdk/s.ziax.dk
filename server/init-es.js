(function () {
  var Server = require('./../server.js')
    , utils = require('./utils.js');

  function routes(app) {
    app.get('/api/me', utils.ensureAuthenticated, function (req, res) {
      res.send(utils.ngSafe(req.user));
    });
  }

  module.exports = {
    routes: routes

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
