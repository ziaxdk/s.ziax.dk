module.exports = function (esClient, app, core) {
  // Suggest
  app.post('/suggest', function (req, res) {
    esClient.suggest(
      {
        "suggest01": {
          "text": req.body.q,
          "term": {
            "field": "header"
          }
        }
      },
      core.escallback(req, res));
  });
};