// (function () {
//   module.exports = function (Config, app, sio) {
//   var Scraper = require('./server-scrape-prod.js')
//       , EsClient = require('elasticsearch').createClient(Config.es.development)
//       , IO = require('./socketio.js')
//       ;
    
//   // app.get('/api/scrape', require('./server-scrape-prod.js').scrape);
//   Scraper.configWithApp(app);
//   IO.configure(sio);

//   };
// }());

//   // // var Scraper = require('./server/server-scrape-dev.js');
//   // var Scraper = require('./server/server-scrape-prod.js');
//   // es = elasticsearch.createClient(Config.es.development);
//   // // core = require('./server/server-core.js')(es, app);
//   // var esobj = require('./server/setup-es')(es, app);
//   // app.get('/api/scrape', Scraper.scrape);
//   // sio.set('transports', ['websocket']);
//   // sio.set('log level', 0);
//   // require('./server/socketio.js')(sio, esobj.esdocument);
//   // // app.use(function (err, req, res, next) {
//   // //   console.log('err', err);
//   // //   res.send("OK");

//   // // });
