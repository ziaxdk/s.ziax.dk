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
    , INDEX = "ziax"
    , core
    ;

var ngSafe = function (val) {
  return ")]}',\n" + JSON.stringify(val);
};

var extend = function (a, b) {
  for(var key in b)
    if(b.hasOwnProperty(key)) a[key] = b[key];
  return a;
};

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
    console.log("configure development");
    Config.me = 'http://localhost:8080/';
    es = elasticsearch.createClient(Config.es.development);
    core = require('./server/server-core.js')(es, app);
});

app.configure('production', function () {
    console.log("configure production");
    Config.me = 'http://dash.ziax.dk/';
    es = elasticsearch.createClient(Config.es.production);
    core = require('./server/server-core.js')(es, app);
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
// app.get('/me', ensureAuthenticated, function (req, res) {
//   res.send(ngSafe(req.user));
// });


// app.get('/drive', function (req, res) {
//   // TODO: If user is authenticated, include onlyAuth also
//   es.search({_index: INDEX}, {
//     query : {
//       match_all: {}
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

// app.post('/drive', ensureAuthenticated, function (req, res) {
//   req.body.clicks = 0;
//   es.index({ _index: INDEX, _type: "drive"}, req.body, function (res2) {
//     res.send(ngSafe(res2));
//   });
// });



// Q

// app.get('/q', function (req, res) {
//   es.search({_index: INDEX}, {
//     query : {
//       term: {
//         header: req.query.q
//       }
//     },
//     facets: {
//       tags: {
//         terms: {
//           field: "tags"
//         }
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
//   es.index({ _index: INDEX, _type: "history" }, { q: req.query.q, q2: req.query.q, createdutc: new Date() }, function (err, data) {
//     console.log('his', err, data);
//   });
// });

// app.post('/q', function (req, res) {
//   es.get({ _index: INDEX, _type: "drive", _id: req.body.id }, function (err, data) {
//     if (err) {
//       console.log(err);
//       res.send(ngSafe("err"));
//       return;
//     }
//     res.send(ngSafe(data));
//   });
//   es.update({ _index: INDEX, _type: "drive", _id: req.body.id }, { "script" : "ctx._source.clicks += 1" }, function (err, data) {
//     console.log (err ? err : data);
//   });
// });

// // Facets
// app.post('/xq', function (req, res) {
//   var xq = {
//     query: {
//       term: {
//         header: req.body.q
//       }
//     },
//     facets: {
//       tags: {
//         terms: {
//           field: "tags"
//         }
//       }
//     }
//   };

//   if (req.body.facets.tags.length !== 0) {
//     xq = extend(xq, {
//       filter: {
//         term: {
//           tags: req.body.facets.tags
//         }
//       }
//     });
//   }

//   es.search({_index: INDEX}, xq, function (err, data) {
//     if (err) {
//       console.log(err);
//       res.send(ngSafe("err"));
//       return;
//     }
//     res.send(ngSafe(data));
//   });
// });

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

// app.put('/history', function (req, res) {
//   console.log(req.body.q);
//   res.send(ngSafe("ok"))
// });


app.get('/history', function (req, res) {
  es.search({_index: INDEX}, {
    facets: {
      history: {
        terms: {
          field: "q2.facet"
        }
      }
    },
    size: 0
  }, function (err, data) {
    if (err) {
      console.log(err);
      res.send(ngSafe("err"));
      return;
    }
    res.send(ngSafe(data));
  });
})


app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 80;
theServer.listen(port, function () {
  console.log("Running on " + port);
});
