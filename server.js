"use strict";
var express = require('express')
    , http = require('http')
    , elasticsearch = require('elasticsearch')
    , passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy
    , _ = require('underscore')
    , Config = require('./_config.json')
    , Promise = require('promise')
    , es = null
    ;

var app = module.exports = express();
var theServer = http.createServer(app);

app.use(express.cookieParser());
// app.use(express.bodyParser()); deprecated
app.use(express.urlencoded());
app.use(express.json());
app.use(express.session({ secret: 'keyboard like ziax dash', key: 'dash.ziax.dk' }));
app.use(passport.initialize());
app.use(passport.session());

app.configure('development', function () {
  var Scraper = require('./server/server-scrape-dev.js');
  console.log("configure development");
  Config.me = 'http://localhost:8080/';
  es = elasticsearch.createClient(Config.es.development);
  // core = require('./server/server-core.js')(es, app);
  require('./server/setup-es')(es, app);
  app.get('/api/scrape', Scraper.scrape);
  // app.use(function (err, req, res, next) {
  //   console.log('err', err);
  //   res.send("OK");

  // });
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

passport.use(new GoogleStrategy(
  {
    returnURL: Config.me +'api/auth/google/callback',
    realm: Config.me,
    stateless: true
  },
  function(identifier, profile, done) {
    if (profile.emails[0].value !== Config.whoami) return done(null, false);
    console.log(profile);
    return done(null , { id: identifier, name: profile.displayName });
  }
));

app.get('/api/auth/google', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) { res.redirect('/'); });

passport.serializeUser(function(user, done) {
  done(null, JSON.stringify(user));
});
passport.deserializeUser(function(user, done) {
  done(null, JSON.parse(user));
});

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
// var port = process.env.PORT || 80;
var port = 8080;
theServer.listen(port, function () {
  console.log("Running on " + port);
});
