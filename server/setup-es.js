(function () {
  module.exports = function (esClient, app) {
    var esCommon = require('./es-common'),
        utils = require('./utils2');

    require('./es-q')(esClient, app);
    require('./es-document')(esClient, app);

    app.get('/api/history', function () {
      esClient.search({_index: esCommon.index}, {
        facets: {
          history: {
            terms: {
              field: "q2.facet"
            }
          }
        },
        size: 0
      }, esCommon.callback(arguments));
    });

    function ensureAuthenticated (req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      // res.redirect('/loginerr');
      res.status(403);
      res.send();
    };



    app.get('/api/me', ensureAuthenticated, function (req, res) {
      res.send(utils.ngSafe(req.user));
    });

    app.post('/api/star', function (req, res) {
      esClient.update({ _index: esCommon.index, _type: req.body.type, _id: req.body.id }, { doc: { "star" : req.body.val } }, function (err, data) {
        console.log (err ? err : data);
      });
      res.send(utils.ngSafe("ok"));
    });
  }
}());