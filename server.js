"use strict";
var express = require('express')
    , http = require('http')
    , elasticsearch = require('elasticsearch')
    , passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy
    , Config = require('./_config.json')
    , Promise = require('promise')
    , es = null
    , INDEX = "ziax"
    ;

var ngSafe = function (val) {
  return ")]}',\n" + JSON.stringify(val);
};
var app = module.exports = express();
var theServer = http.createServer(app);

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard like ziax dash' }));
app.use(passport.initialize());
app.use(passport.session());

app.configure('development', function () {
    console.log("configure development");
    Config.me = 'http://localhost:8080/';
    es = elasticsearch.createClient(Config.es.development);
});

app.configure('production', function () {
    console.log("configure production");
    Config.me = 'http://dash.ziax.dk/'
    es = elasticsearch.createClient(Config.es.production);
});

app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) { res.redirect('/'); });

passport.use(new GoogleStrategy(
  {
    returnURL: Config.me +'auth/google/callback',
    realm: Config.me
  },
  function(identifier, profile, done) {
    if (profile.emails[0].value !== Config.whoami) return done(null, false, { message: 'No can do' });
    console.log('user auth ok');
    return done(null , { id: identifier, name: profile.displayName })
  }
));

passport.serializeUser(function(user, done) {
  done(null, JSON.stringify(user));
});
passport.deserializeUser(function(user, done) {
  done(null, JSON.parse(user));
});

var ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
};

app.get('/debug', function (req, res) {
  console.log(req.user);
  res.send("ok");
});

// Drive
/*var promise = new Promise(function (resolve, reject) {
  get('http://www.google.com', function (err, res) {
    if (err) reject(err);
    else resolve(res);
  });
});*/

app.get('/drive', function (req, res) {
  es.search({_index: INDEX}, {
    query : {
      match_all: {}
    }
  }, function (err, data) {
    if (err) {
      console.log(err);
      res.send(ngSafe("err"));
      return;
    }
    res.send(ngSafe(data));
  });
});

app.post('/drive', ensureAuthenticated, function (req, res) {
  // if (req.body.code !== Config.code) {
  //   res.send(ngSafe({err: "code"}));
  //   return;
  // }
  req.body.clicks = 0;
  es.index({ _index: INDEX, _type: "drive"}, req.body, function (res2) {
    res.send(ngSafe(res2));
  });
});



// Q

app.get('/q', function (req, res) {
  es.search({_index: INDEX}, {
    query : {
      term: {
        header: req.query.q
      }
    },
    facets: {
      tags: {
        terms: {
          field: "tags"
        }
      }
    }
  }, function (err, data) {
    if (err) {
      console.log(err);
      res.send(ngSafe("err"));
      return;
    }
    res.send(ngSafe(data));
  });
});

app.post('/q', function (req, res) {
  es.get({ _index: INDEX, _type: "drive", _id: req.body.id }, function (err, data) {
    if (err) {
      console.log(err);
      res.send(ngSafe("err"));
      return;
    }
    res.send(ngSafe(data));
  });
})
app.put('/q', function (req, res) {
  es.update({ _index: INDEX, _type: "drive", _id: req.body.id }, { "script" : "ctx._source.clicks += 1" }, function (err, data) {
    if (err) {
      console.log(err);
      res.send(ngSafe("err"));
      return;
    }
    res.send(ngSafe(data));
  });
});

// Suggest

app.post('/suggest', function (req, res) {
  es.suggest(
    {
      "suggest01": {
        "text": req.body.q,
        "term": {
          "field": "header"
        }
      }
    }, function (err, data) {
    if (err) {
      console.log(err);
      res.send(ngSafe("err"));
      return;
    }
    res.send(ngSafe(data));
  });
});


app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 80;
theServer.listen(port, function () {
  console.log("Running on " + port);
});
