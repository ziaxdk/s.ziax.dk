module.exports = function (esClient, app, core) {

  app.get('/api/q', function (req, res) {
    esClient.search({ _index: core.INDEX, _type: 'article,link,place' }, {
      "query": {
        "function_score": {
          "query": {
            "query_string": {
              "fields": [ "header^4", "content^2" ],
              "query": req.query.q
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
    }, core.escallback(req, res));
    esClient.index({ _index: core.INDEX, _type: "history" }, { q: req.query.q, q2: req.query.q, createdutc: new Date() }, function (err, data) {
      // console.log('his', err, data);
    });
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
