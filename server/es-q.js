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
    }
  }

  function getAll() {
    return {
      "match_all": {}
    }
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
    if (!tags || tags.terms.length == 0) return {};
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
    if (!tags || tags.terms.length == 0 || tags.operator !== 'and') return {};

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
    }
  }

  function addMeta(idx, size) {
    return {
      "size": size,
      "from": idx * size
    }
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
        type: types.join()
      }
    }

    var type = _.find(es.types, function (t) {
      var r = new RegExp('^_' + t + ':');
      return r.test(data.q);
    });
    if (!type) return {
        q: q,
        type: types.join()
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
      es.client.search({ _index: es.index, _type: qObject.type }, build(qObject.q, data.facets.tags, data.pager.idx), es.callback(arguments));
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



  // function build2 (q, tags) {
  //   var query = {
  //     "query": {
  //       "function_score": {
  //         "query": {
  //           "query_string": {
  //             "fields": [ "header^4", "content^3", "tags^2" ],
  //             "query": q
  //           }
  //         },
  //         "functions": [
  //         {
  //           "boost_factor": "1000",
  //           "filter": {
  //             "term": {
  //               "star": true
  //             }
  //           }
  //         }
  //         ]
  //       }
  //     },
  //     facets: {
  //       types: {
  //         terms: {
  //           field : "_type"
  //         }
  //       },
  //       tags: {
  //         terms: {
  //           field: "tags"
  //         }
  //       }
  //     }
  //   }

  //   if (tags && tags.terms.length !== 0) {
  //     deepExtend(query, {
  //       filter: {
  //         terms: {
  //           tags: tags.terms,
  //           execution: tags.operator
  //         }
  //       }
  //     });

  //     if (tags.operator == 'and') {
  //       deepExtend(query, {
  //         facets: {
  //           tags: {
  //             "facet_filter": {
  //               terms: {
  //                 tags: tags.terms,
  //                 execution: tags.operator
  //               }
  //             }
  //           }
  //         }

  //       });
  //     }
  //   }

  //   // utils.log(query);

  //   return query;
  // };
