(function () {
  "use strict";
  var express = require('express')
    , http = require('http')
    , io = require('socket.io')
    , app = express()
    , server = http.createServer(app)
    , passport = require('passport')
    , sio = io.listen(server)
    , Config = require('./_config.json')
    , utils = require('./server/utils.js')
    , port = process.env.PORT || 8080;

  module.exports = {
    app: app,
    sio: sio
  }


  app.use(express.cookieParser());
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.session({ secret: 'keyboard like ziax dash', key: 'dash.ziax.dk' }));
  // app.use(passport.initialize());
  // app.use(passport.session());
  // app.use(passport.authenticate('remember-me'));
  app.use(express.static(__dirname + "/src"));

  app.configure('development', function () {
    console.log("configure development");
    Config.me = 'http://localhost:' + process.env.PORT + '/';
    sio.set('transports', ['websocket']);
    sio.set('log level', 0);
    require('./server/init-es.js').routes(app);

  });



  server.listen(port, function () {
    console.log("Running on " + port);
  });

}());