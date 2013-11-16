(function () {
  var Utils = require('./utils');

  var scrape = function (req, res) {
    console.log(req.query.q);

    res.send(Utils.ngSafe({
      header: "just a dummy title that came from a silly hardcoded scraper",
      content: "some silly content that should be coming from a mega monster silly scraper"
    }));

  };


  var obj = {
    scrape: scrape
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = obj;
  }
  else {
    root.utils = obj;
  }
}());
