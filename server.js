"use strict";
var express = require('express')
    , http = require('http')
    , elasticsearch = require('elasticsearch')
    , passport = require('passport')
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

app.post('/drive', function (req, res) {
  if (req.body.code !== Config.code) {
    res.send(ngSafe({err: "code"}));
    return;
  }
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

app.configure('development', function () {
    console.log("configure development");
    es = elasticsearch.createClient(Config.es.development);
});

app.configure('production', function () {
    console.log("configure production");
    es = elasticsearch.createClient(Config.es.production);
});


app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 80;
theServer.listen(port, function () {
  console.log("Running on " + port);
});
