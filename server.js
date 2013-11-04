"use strict";
var express = require('express')
    , http = require('http')
    , elasticsearch = require('elasticsearch')
    , passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy
    , GitHubStrategy = require('passport-github').Strategy
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
app.use(express.session({ secret: 'keyboard like ziax dash', key: 'dash.ziax.dk' }));
app.use(passport.initialize());
app.use(passport.session());

app.configure('development', function () {
    console.log("configure development");
    Config.me = 'http://localhost:8080/';
    es = elasticsearch.createClient(Config.es.development);
});

app.configure('production', function () {
    console.log("configure production");
    Config.me = 'http://dash.ziax.dk/';
    es = elasticsearch.createClient(Config.es.production);
});

passport.use(new GoogleStrategy(
  {
    returnURL: Config.me +'auth/google/callback',
    realm: Config.me,
    stateless: true
  },
  function(identifier, profile, done) {
    if (profile.emails[0].value !== Config.whoami) return done(null, false);
    console.log(profile);
    return done(null , { id: identifier, name: profile.displayName });
  }
));

app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) { res.redirect('/'); });

// passport.use(new GitHubStrategy({
//     clientID: '70311a09df9ecf648bd7',
//     clientSecret: '0cc0ccbe2c7bc3ea217b70604da1e5935ec5e5a7',
//     callbackURL: "http://localhost:8080/auth/github/callback",
//     scope: ['user', 'user:email']
//   },
//   function(accessToken, refreshToken, profile, done) {
//     // User.findOrCreate({ githubId: profile.id }, function (err, user) {
//     //   return done(err, user);
//     // });
//     console.log(profile)
//     return done(null, { id: 1});
//   }
// ));

// app.get('/auth/github', passport.authenticate('github'));
// app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) { res.redirect('/'); });

passport.serializeUser(function(user, done) {
  done(null, JSON.stringify(user));
});
passport.deserializeUser(function(user, done) {
  done(null, JSON.parse(user));
});

var ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/loginerr');
};

app.get('/debug', function (req, res) {
  console.log(req.user);
  res.send("ok");
});

app.get('/suggest', function (req, res) {
  es.suggest({_index: INDEX}, {
    text: req.query.q,
    "suggest_term": {
      term: {
        field: "header"
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

// Drive
/*var promise = new Promise(function (resolve, reject) {
  get('http://www.google.com', function (err, res) {
    if (err) reject(err);
    else resolve(res);
  });
});*/

// Me
app.get('/me', ensureAuthenticated, function (req, res) {
  res.send(ngSafe(req.user));
});


app.get('/drive', function (req, res) {
  // TODO: If user is authenticated, include onlyAuth also
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

// Facets
app.post('/xq', function (req, res) {
  es.search({_index: INDEX}, {
    query : {
      term: {
        header: req.body.q
      }
    },
    filter: {
      term: {
        tags: req.body.facets.tags
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
    console.log(data);
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

app.put('/history', function (req, res) {
  console.log(req.body.q);
  res.send(ngSafe("ok"))
});


app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 80;
theServer.listen(port, function () {
  console.log("Running on " + port);
});
