module.exports = function (esClient, app, core) {
  var _ = require('underscore');

  
  function build (q, tags) {
    var query = {
      "query": {
        "function_score": {
          "query": {
            "query_string": {
              "fields": [ "header^4", "content^2" ],
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

    if (tags && tags.length !== 0) {
      _.extend(query, {
        filter: {
          term: {
            tags: tags
          }
        }
      });
    }



    return query;
  };

  
  app.get('/api/q', function (req, res) {
    var data = req.query;
    esClient.search({ _index: core.INDEX, _type: 'article,link,place' }, build(data.q, null), core.escallback(req, res));
    esClient.index({ _index: core.INDEX, _type: "history" }, { q: req.query.q, q2: req.query.q, createdutc: new Date() }, function (err, data) {
      // console.log('his', err, data);
    });
  });

  app.post('/api/xq', function (req, res) {
    var data = req.body;
    esClient.search({ _index: core.INDEX, _type: data.types.join() }, build(data.q, data.facets.tags), core.escallback(req, res));
  });

  app.post('/api/q', function (req, res) {
    esClient.get({ _index: core.INDEX, _type: req.body.type, _id: req.body.id }, core.escallback(req, res));
    esClient.update({ _index: core.INDEX, _type: req.body.type, _id: req.body.id }, { "script" : "ctx._source.clicks += 1" }, function (err, data) {
      //console.log (err ? err : data);
    });
  });

};

// {
//     "query": {
//          "function_score": {
//              "query": {
//                  "query_string": {
//                     "fields": [ "header", "content" ],
//                     "query": "node"
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
//     }
// }
