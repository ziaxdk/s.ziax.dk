module.exports = function (esClient, app, core) {

  var _ = require('underscore');

  // Facets
  app.post('/api/xq', function (req, res) {
    var xq = {
      query: {
        term: {
          header: req.body.q
        }
      },
      facets: {
        tags: {
          terms: {
            field: "tags"
          }
        }
      }
    };

    if (req.body.facets.tags.length !== 0) {
      _.extend(xq, {
        filter: {
          term: {
            tags: req.body.facets.tags
          }
        }
      });
    }

    esClient.search({ _index: core.INDEX, _type: req.body.types.join() }, xq, core.escallback(req, res));
  });
};