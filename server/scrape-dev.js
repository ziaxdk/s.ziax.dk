(function () {
  var Utils = require('./utils');

  var scrape = function (req, res) {
    // console.log(req.query.q);

    var obj = {
      title1: null,
      title2: "just a dummy title that came from a silly hardcoded scraper",

      desc1: "some silly content that should be coming from a mega monster silly scraper",
      desc2: "some silly content that should be coming from a mega monster silly scraper"
    }

    setTimeout(function () {
      res.send(Utils.ngSafe(obj));
    }, 2000);

  };

  function routes(app) {
    app.get('/api/scrape', scrape);
  }


  module.exports = {
    routes: routes
  };

}());
