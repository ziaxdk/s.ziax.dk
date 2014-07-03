var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),

    http = require('http'),
    app = express(),
    server = http.createServer(app),

    io = require('socket.io'),
    sio = io.listen(server),
    Config = require('./_config.json'),
    utils = require('./server/utils.js'),
    port = process.env.PORT || 8081,
    env = process.env.NODE_ENV || 'development';

module.exports = {
  app: app,
  sio: sio
};


app.use(cookieParser());
app.use(bodyParser());
app.use(express.static(__dirname + "/src"));
app.use(session({ secret: 'keyboard like ziax dash', key: 'dash.ziax.dk' }));

if ('development' === env) {
  console.log("configure development");
  app.enable('trust proxy');
  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
    next();
   });
  sio.set('transports', ['websocket']);
  sio.set('log level', 1);

  Config.me = 'http://localhost:' + port + '/';
  require('./server/auth.js');
  require('./server/es.js').routes(app);
  require('./server/es-q.js').routes(app);
  require('./server/es-aviation.js').routes(app);
  require('./server/es-document.js').routes(app);
  require('./server/es-gaz.js').routes(app);
  require('./server/scrape-prod.js').routes(app);
  require('./server/testv4.js').route(app);
  require('./server/socketio.js');
}
else if ('production' === env) {
  console.log("configure production");
  app.enable('trust proxy');
  port = 8081;
  Config.me = Config.host + '/';
  sio.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
  sio.set('log level', 0);
  sio.enable('browser client minification');
  sio.enable('browser client etag');
  sio.enable('browser client gzip');

  require('./server/auth.js');
  require('./server/es.js').routes(app);
  require('./server/es-q.js').routes(app);
  require('./server/es-aviation.js').routes(app);
  require('./server/es-document.js').routes(app);
  require('./server/es-gaz.js').routes(app);
  require('./server/scrape-prod.js').routes(app);
  require('./server/socketio.js');
}


server.listen(port, function () {
  console.log("Running on " + port);
});
