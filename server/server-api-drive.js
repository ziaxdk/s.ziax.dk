module.exports = function (esClient, app, core) {
  // Drive
  // app.get('/api/drive', function (req, res) {
  //   // TODO: If user is authenticated, include onlyAuth also
  //   esClient.search({_index: core.INDEX}, {
  //     query : {
  //       match_all: {}
  //     }
  //   }, core.escallback(req, res));
  // });
  app.get('/api/drive', function (req, res) {
    esClient.count({_index: core.INDEX}, {
      "term" : { "_type" : "drive" }
    }, core.escallback(req,res));
  })

  app.post('/api/drive', core.ensureAuthenticated, function (req, res) {
    req.body.clicks = 0;
    esClient.index({ _index: core.INDEX, _type: "drive"}, req.body, core.escallback(req, res));
  });
};