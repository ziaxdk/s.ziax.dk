(function () {
  var deepExtend = require('deep-extend')
      , _ = require('lodash')
      , deepExtend = require('deep-extend')
      , utils = require('./utils.js')
      , es = require('./es.js');


  function getQuery(q) {
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

  function getAll() {
    return {
      "match_all": {}
    };
  }


  function getScope(q, tags) {
    return {
      "query": {
        "function_score": {
          "query": q === '*' ? getAll() : getQuery(q),
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

  function build (q, tags, idx, size) {
    var query = getScope(q, tags);
    deepExtend(query, getFacets());
    deepExtend(query, addFilters(tags));
    deepExtend(query, addFacetFilters(tags));
    deepExtend(query, addMeta(idx||0, size||10));
    // utils.log(query);
    return query;
  }



  function getTypes (data) {
    var q = data.q
      , types = data.types || es.types;
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
        type: 'place',
        body: build('*', undefined, undefined, 5000)
      }, es.callback(arguments));
    });

    app.get('/api/q', function (req) {
      var data = req.query;
      var qObject = getTypes(data);
      es.client.search({
        index: es.index,
        type: qObject.type,
        body: build(qObject.q, null)
      }, es.callback(arguments));
      es.client.index({ index: es.index, type: 'history', body: { q: req.query.q, q2: req.query.q, createdutc: new Date() }}, function (err, data) { });
    });

    app.post('/api/xq', function (req) {
      var data = req.body;
      var qObject = getTypes(data);
      es.client.search({
        index: es.index,
        type: qObject.type,
        body: build(qObject.q, data.facets.tags, data.pager.idx)
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
}());

// "script_score": 
// {
//   "script": "_score * doc['clicks'].value"
// }


// {
//     "query": {
//       "function_score": {
//         "query": {
//           "multi_match": {
//             "query": "safari",
//             "fields": [
//               "header^4",
//               "content^3",
//               "tags^2"
//             ]
//           }
//         },
//         "functions": [
//           {
//             "filter": {
//               "term": {
//                 "star": true
//               }
//             },
//             "boost_factor": 1000
//           }
//         ]
//       }
//     },
//     "facets": {
//       "types": {
//         "terms": {
//           "field": "_type"
//         }
//       },
//       "tags": {
//         "terms": {
//           "field": "tags"
//         }
//       }
//     },
//     "size": 10,
//     "from": 0
//   }
//   