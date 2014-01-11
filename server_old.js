"use strict";
var express = require('express')
    , http = require('http')
    , io = require('socket.io')
    , elasticsearch = require('elasticsearch')
    , passport = require('passport')
    , GoogleStrategy2 = require('passport-google-oauth').OAuth2Strategy
    , RememberMeStrategy = require('passport-remember-me').Strategy
    , _ = require('underscore')
    , Users = require('./server/Users.js')()
    , Config = require('./_config.json')
    , es = null
    , Setup = require('./server/setup-server.js')
    ;

var app = express();
var theServer = http.createServer(app);
var sio = io.listen(theServer);

app.use(express.cookieParser());
// app.use(express.bodyParser()); deprecated
app.use(express.urlencoded());
app.use(express.json());
app.use(express.session({ secret: 'keyboard like ziax dash', key: 'dash.ziax.dk' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

app.configure('development', function () {
  console.log("configure development");
  Config.me = 'http://localhost:' + process.env.PORT + '/';

  Setup(Config, app, sio);
  sio.set('transports', ['websocket']);
  sio.set('log level', 2);
});

app.configure('production', function () {
  var Scraper = require('./server/server-scrape-prod.js');
  console.log("configure production");
  Config.me = 'http://s.ziax.dk/';
  es = elasticsearch.createClient(Config.es.production);
  // core = require('./server/server-core.js')(es, app);
  require('./server/setup-es')(es, app);
  app.get('/api/scrape', Scraper.scrape);
});

passport.use(new GoogleStrategy2({
    clientID: '231761169549-j0ruk7pr12eqsdqbivrvoc5a29o29s55.apps.googleusercontent.com',
    clientSecret: 'eK4lxm-VGUUD1xCwexTKGbJo',
    callbackURL: Config.me + 'api/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    var _user = Users.getByEmail(profile.emails[0].value);
    if (!_user) return done(null, false);
    // if (profile.emails[0].value !== Config.whoami) return done(null, false);
    return done(null , _user);
  }
));

passport.serializeUser(function(user, done) {
  done(null, JSON.stringify(user));
});
passport.deserializeUser(function(user, done) {
  done(null, JSON.parse(user));
});

app.get('/api/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
  res.cookie('remember_me', req.user.id , { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
  // console.log('req.user', req.user);
  res.redirect('/'); 
});

passport.use(new RememberMeStrategy(
  function(token, done) {
    var _user = Users.getById(token)
    if (!_user) return done(null, false);
    return done(null, _user);
    // Token.consume(token, function (err, user) {
    //   if (err) { return done(err); }
    //   if (!user) { return done(null, false); }
    //   return done(null, user);
    // });
  },
  function(user, done) {
    // var token = utils.generateToken(64);
    // Token.save(token, { userId: user.id }, function(err) {
    //   if (err) { return done(err); }
    //   return done(null, token);
    // });
    return done(null, user.id);
  }
));

app.get('/test', function (req, res) {
  // res.cookie('remember_me', '1001', { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
  // // console.log(req.sessionID)
  // console.log('req.user', req.user);
  sio.sockets.emit('news', 'foobar');
  res.send("ok");
});
// app.post('/api/auth/remember', 
//   passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
//   function(req, res, next) {
//     // issue a remember me cookie if the option was checked
//     if (!req.body.remember_me) { return next(); }

//     var token = utils.generateToken(64);
//     Token.save(token, { userId: req.user.id }, function(err) {
//       if (err) { return done(err); }
//       res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
//       return next();
//     });
//   },
//   function(req, res) {
//     res.redirect('/');
//   });

/* * */

// passport.use(new GoogleStrategy(
//   {
//     returnURL: Config.me +'api/auth/google/callback',
//     realm: Config.me,
//     stateless: true
//   },
//   function(identifier, profile, done) {
//     if (profile.emails[0].value !== Config.whoami) return done(null, false);
//     console.log(profile);
//     return done(null , { id: identifier, name: profile.displayName });
//   }
// ));

// app.get('/api/auth/google', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));
// app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) { res.redirect('/'); });

// passport.serializeUser(function(user, done) {
//   done(null, JSON.stringify(user));
// });
// passport.deserializeUser(function(user, done) {
//   done(null, JSON.parse(user));
// });

/* * */

// app.get('/suggest', function (req, res) {
//   es.suggest({_index: INDEX}, {
//     text: req.query.q,
//     "suggest_term": {
//       term: {
//         field: "header"
//       }
//     }
//   }, function (err, data) {
//     if (err) {
//       console.log(err);
//       res.send(ngSafe("err"));
//       return;
//     }
//     res.send(ngSafe(data));
//   });
// });

// app.get('/api/debug', function (req, res) {
//   console.log(req.headers);
//   res.send("ok");
// });

app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 8080;
theServer.listen(port, function () {
  console.log("Running on " + port);
});
