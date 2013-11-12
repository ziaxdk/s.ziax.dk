module.exports = function (esClient, app, core) {
  var Promise = require('promise');

  app.get('/api/front', function (req, res) {

    var p1 = new Promise(function (resolve, reject) {
      esClient.count({_index: core.INDEX}, { "term" : { "_type" : "drive" } }, function (err, data) { 
        if (err) reject(err);
        else resolve(data);
      });
    });

    var p2 = new Promise(function (resolve, reject) {
      esClient.search({_index: core.INDEX}, {
        facets: {
          history: {
            terms: {
              field: "q2.facet"
            }
          }
        },
        size: 0
      }, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

    Promise.all(p1, p2).then(function (data) {
      res.send(data);
    })
  });
};