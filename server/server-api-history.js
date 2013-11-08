module.exports = function (esClient, app, core) {
  // History
  app.get('/api/history', function (req, res) {
    esClient.search({_index: core.INDEX}, {
      facets: {
        history: {
          terms: {
            field: "q2.facet"
          }
        }
      },
      size: 0
    }, core.escallback(req, res));
  });
};