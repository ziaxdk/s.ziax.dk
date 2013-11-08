module.exports = function (esClient, app, core) {

  app.get('/api/q', function (req, res) {
    esClient.search({_index: core.INDEX}, {
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
    }, core.escallback(req, res));
    esClient.index({ _index: core.INDEX, _type: "history" }, { q: req.query.q, q2: req.query.q, createdutc: new Date() }, function (err, data) {
      console.log('his', err, data);
    });
  });

  app.post('/api/q', function (req, res) {
    esClient.get({ _index: core.INDEX, _type: "drive", _id: req.body.id }, core.escallback(req, res));
    esClient.update({ _index: core.INDEX, _type: "drive", _id: req.body.id }, { "script" : "ctx._source.clicks += 1" }, function (err, data) {
      console.log (err ? err : data);
    });
  });


};