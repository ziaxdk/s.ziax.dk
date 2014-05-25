var deepExtend = require('deep-extend'),
    async = require('async'),
    _ = require('lodash'),
    utils = require('./utils.js'),
    es = require('./es.js');

function getQuery_Root(q, onlyAuth) {
  var root = {
    "query": {
      "filtered": {
        "query": getQuery(q),
        "filter": {
          "or": {
            "filters": [
              getQuery_Root_Filters(false),
              getQuery_Root_Filters(true && onlyAuth)
              // {
              //   "term": {
              //     "onlyAuth": true
              //   }
              // },
              // {
              //   "term": {
              //     "onlyAuth": false
              //   }
              // }
            ]
          }
        }
      }
    }
  };
  // console.log(onlyAuth, root.query.filtered.filter.or.filters)
  return root;
}

function getQuery_Root_Filters(onlyAuth) {
  return {
    "term": {
      "onlyAuth": onlyAuth
    }
  };
}

function getQueryBody_MultiMatch(q) {
  return {
    "multi_match": {
      "query": q,
      "fields": [
        "header^4",
        "content^3",
        "tags^2"
      ]
    }
  };
}

function getQueryBody_MatchAll() {
  return {
    "match_all": {}
  };
}

function getQuery(q) {
  return {
    "function_score": {
      "query": q === '*' ? getQueryBody_MatchAll() : getQueryBody_MultiMatch(q),
      "functions": [
        {
          "filter": {
            "term": {
              "star": true
            }
          },
          "boost_factor": 1000
        },
        {
          "script_score":
          {
            "script": "_score * doc['clicks'].value"
          }
        }
      ]
    }
  };
}

function getFacets() {
  return {
    facets: {
      types: {
        terms: {
          field : "_type"
        }
      },
      tags: {
        terms: {
          field: "tags"
        }
      }
    }
  };
}

function addFilters(tags) {
  if (!tags || tags.terms.length === 0) return {};
  return {
    filter: {
      terms: {
        tags: tags.terms,
        execution: tags.operator
      }
    }
  };
}

function addFacetFilters(tags) {
  if (!tags || tags.terms.length === 0 || tags.operator !== 'and') return {};

  return {
    facets: {
      tags: {
        "facet_filter": {
          terms: {
            tags: tags.terms,
            execution: tags.operator
          }
        }
      }
    }
  };
}

function addMeta(idx, size) {
  return {
    "size": size,
    "from": idx * size
  };
}

function build (q, tags, idx, size, onlyAuth) {
  // var query = getQuery(q);
  var query = getQuery_Root(q, onlyAuth);
  deepExtend(query, getFacets());
  deepExtend(query, addFilters(tags));
  deepExtend(query, addFacetFilters(tags));
  deepExtend(query, addMeta(idx||0, size||10));
  // utils.log(query);
  return query;
}



function getTypes (data) {
  var q = data.q,
      types = data.types || es.types;
  if (q.indexOf(':') === -1) {
    return {
      q: q,
      type: types
    };
  }

  var type = _.find(es.types, function (t) {
    var r = new RegExp('^_' + t + ':');
    return r.test(data.q);
  });
  if (!type) return {
      q: q,
      type: types
  };
  
  q = q.substring(q.indexOf(':') + 1, q.length);
  if(!q) q = "SPASSER";

  return {
    q: q,
    type: type
  };
}

function routes(app) {
  app.get('/api/places', function(req) {
    es.client.search({
      index: es.index,
      type: [ 'place', 'flight' ],
      body: build('*', undefined, undefined, 5000, !!req.user)
    }, es.callback(arguments));
  });

  // function peep1(done) {
  //   es.client.search({
  //     index: es.index,
  //     type: 'place',
  //     body: build('*', undefined, undefined, 5000)
  //   }, function(err, data) {
  //     if (err) return done(err);
  //     done(null, data);
  //   });
  // }
  // function peep2(done) {
  //   iss.getTLE(function() {
  //     done(null, arguments[1]);
  //   });
  // }

  // app.get('/api/placeswithiss', function(req, res) {
  //   async.parallel([ peep1, peep2 ], function(err, data) {
  //     res.send(utils.ngSafe({ places: data[0], tle: data[1] }));
  //   });
  // });

  app.post('/api/places', function(req) {
    var data = req.body;
    es.client.search({
      index: es.index,
      type: [ 'place', 'flight' ],
      body: build('*', data.facets.tags, undefined, 5000, !!req.user)
    }, es.callback(arguments));
  });

  app.get('/api/q', function (req) {
    var data = req.query;
    var qObject = getTypes(data);
    es.client.search({
      index: es.index,
      type: qObject.type,
      body: build(qObject.q, null, 0, 10, !!req.user)
    }, es.callback(arguments));
    es.client.index({ index: es.index, type: 'history', body: { q: req.query.q, q2: req.query.q, createdutc: new Date() }}, function (err, data) { });
  });

  app.post('/api/xq', function (req) {
    var data = req.body;
    var qObject = getTypes(data);
    es.client.search({
      index: es.index,
      type: qObject.type,
      body: build(qObject.q, data.facets.tags, data.pager.idx, 10, !!req.user)
    }, es.callback(arguments));
  });

  app.post('/api/q', function (req) {
    es.client.get({ index: es.index, type: req.body.type, id: req.body.id }, es.callback(arguments));
    es.client.update({
      index: es.index,
      type: req.body.type,
      id: req.body.id,
      body: {
        "script" : "ctx._source.clicks += 1"
      }
    }, function(err, data) { });
  });
}

module.exports = {
  routes: routes

};

// {
//   "query": {
//     "filtered": {
//       "query": {
//         "indices": {
//           "indices": [
//             "ziax",
//             "aviation"
//           ],
//           "query": {
//             "function_score": {
//               "query": {
//                 "multi_match": {
//                   "query": "ekch",
//                   "fields": [
//                     "header^4",
//                     "content^3",
//                     "tags^2",
//                     "ident",
//                     "iata",
//                     "name"
//                   ]
//                 }
//               },
//               "functions": [
//                 {
//                   "filter": {
//                     "term": {
//                       "star": true
//                     }
//                   },
//                   "boost_factor": 1000
//                 },
//                 {
//                   "script_score": {
//                     "script": "_score * (doc.containsKey('clicks') ? doc['clicks'].value : 1)"
//                   }
//                 }
//               ]
//             }
//           },
//           "no_match_query": "none"
//         }
//       },
//       "filter": {
//         "terms": {
//           "_type": [
//             "article",
//             "link",
//             "place",
//             "airport"
//           ]
//         }
//       }
//     }
//   }
// }