var express = require('express'),
  http = require('http'),
  io = require('socket.io'),
  app = express(),
  server = http.createServer(app),
  passport = require('passport'),
  sio = io.listen(server),
  Config = require('./_config.json'),
  utils = require('./server/utils.js'),
  port = process.env.PORT || 8081;

module.exports = {
  app: app,
  sio: sio
};


app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.session({ secret: 'keyboard like ziax dash', key: 'dash.ziax.dk' }));
app.use(express.static(__dirname + "/src"));

app.configure('development', function () {
  console.log("configure development");
  Config.me = 'http://localhost:' + process.env.PORT + '/';
  sio.set('transports', ['websocket']);
  sio.set('log level', 1);
  require('./server/auth.js');
  require('./server/es.js').routes(app);
  require('./server/es-q.js').routes(app);
  require('./server/es-aviation.js').routes(app);
  require('./server/es-document.js').routes(app);
  require('./server/es-gaz.js').routes(app);
  require('./server/scrape-prod.js').routes(app);
  require('./server/socketio.js');
});

app.configure('production', function () {
  console.log("configure production");
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
});


server.listen(port, function () {
  console.log("Running on " + port);
});
