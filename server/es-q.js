(function () {
  var deepExtend = require('deep-extend'),
      _ = require('underscore'),
      utils = require('./utils.js'),
      es = require('./es.js');


  function build (q, tags) {
    var query = {
      "query": {
        "function_score": {
          "query": {
            "query_string": {
              "fields": [ "header^4", "content^3", "tags^2" ],
              "query": q
            }
          },
          "functions": [
          {
            "boost_factor": "1000",
            "filter": {
              "term": {
                "star": true
              }
            }
          }
          ]
        }
      },
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
    }

    if (tags && tags.terms.length !== 0) {
      deepExtend(query, {
        filter: {
          terms: {
            tags: tags.terms,
            execution: tags.operator
          }
        },
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
      });
    }

    // utils2.log(query);

    return query;
  };

  function getTypes (data) {
    var q = data.q;
    if (q.indexOf(':') === -1) {
      return {
        q: q,
        type: es.types.join()
      }
    }

    var type = _.find(es.types, function (t) {
      var r = new RegExp('^_' + t + ':');
      return r.test(data.q);
    });
    if (!type) return {
        q: q,
        type: es.types.join()
    }
    
    q = q.substring(q.indexOf(':') + 1, q.length);
    if(!q) q = "SPASSER";

    return { 
      q: q,
      type: type
    };
  }

  function routes(app) {
    app.get('/api/q', function (req) {
      var data = req.query;
      var qObject = getTypes(data);
      es.client.search({ _index: es.index, _type: qObject.type }, build(qObject.q, null), es.callback(arguments));
      es.client.index({ _index: es.index, _type: "history" }, { q: req.query.q, q2: req.query.q, createdutc: new Date() }, function (err, data) { });
    });

  app.post('/api/xq', function (req) {
    var data = req.body;
    var qObject = getTypes(data);
    es.client.search({ _index: es.index, _type: qObject.type }, build(qObject.q, data.facets.tags), es.callback(arguments));
  });

  app.post('/api/q', function (req) {
    es.client.get({ _index: es.index, _type: req.body.type, _id: req.body.id }, es.callback(arguments));
    es.client.update({ _index: es.index, _type: req.body.type, _id: req.body.id }, { "script" : "ctx._source.clicks += 1" }, function (err, data) { });
  });
  }

  module.exports = {
    routes: routes

  }
}());

// {
//     "query": {
//          "function_score": {
//              "query": {
//                  "query_string": {
//                     "fields": [ "header", "content" ],
//                     "query": "*"
//                  }
//              },
//              "functions": [
//                  {
//                     "boost_factor": "1000",
//                     "filter": {
//                         "term": {
//                             "star": true
                            
//                         }
//                     }
//                 }
//              ]
//         }
//     },
//     facets: {
//         types: {
//           terms: {
//             field : "_type"
//           }
//         },
//         tags: {
//           terms: {
//             field: "tags"
//           },
//             "facet_filter" : {
//                 "term" : { 
//                     "tags" : "javascript"
//                 }
//             }
//         }
//     },
//     "filter": {
//         "term": {
//            "tags": "javascript"
//         }
//     }
// }
