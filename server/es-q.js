module.exports = function (esClient, app, core) {
  var deepExtend = require('deep-extend'),
      _ = require('underscore'),
      utils2 = require('./utils2'),
      esCommon = require('./es-common');

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
        type: esCommon.types.join()
      }
    }

    var type = _.find(esCommon.types, function (t) {
      var r = new RegExp('^_' + t + ':');
      return r.test(data.q);
    });
    if (!type) return {
        q: q,
        type: esCommon.types.join()
    }
    
    q = q.substring(q.indexOf(':') + 1, q.length);
    if(!q) q = "SPASSER";

    return { 
      q: q,
      type: type
    };
  }

  
  app.get('/api/q', function (req) {
    var data = req.query;
    var qObject = getTypes(data);
    esClient.search({ _index: esCommon.index, _type: qObject.type }, build(qObject.q, null), esCommon.callback(arguments));
    esClient.index({ _index: esCommon.index, _type: "history" }, { q: req.query.q, q2: req.query.q, createdutc: new Date() }, function (err, data) { });
  });

  app.post('/api/xq', function (req) {
    var data = req.body;
    var qObject = getTypes(data);
    esClient.search({ _index: esCommon.index, _type: qObject.type }, build(qObject.q, data.facets.tags), esCommon.callback(arguments));
  });

  app.post('/api/q', function (req) {
    esClient.get({ _index: esCommon.index, _type: req.body.type, _id: req.body.id }, esCommon.callback(arguments));
    esClient.update({ _index: esCommon.index, _type: req.body.type, _id: req.body.id }, { "script" : "ctx._source.clicks += 1" }, function (err, data) { });
  });

};

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
