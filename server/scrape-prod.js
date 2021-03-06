(function () {
  var Utils = require('./utils.js')
    // , Nodeio = require('node.io')
    , request = require('request')
    , cheerio = require('cheerio')
    , Q = require('q');

  // var fetch = function (url) {

    // var promise = new Promise(function (resolve, reject) {
    //   get('http://www.google.com', function (err, res) {
    //     if (err) reject(err);
    //     else resolve(res);
    //   });
    // });
    
  //   var promise = new Promise(function (resolve, reject) {
  //     Nodeio.scrape(function() {
  //       this.getHtml(url, function(err, $) {
  //         if (err) reject(err);
  //         else resolve($);
  //       });
  //     });
  //   });
  //   return promise;
  // }


  // var fetchQ = function (url) {
  //   var q = Q.defer();
  //   Nodeio.scrape(function() {
  //     this.getHtml(url, function(err, $) {
  //       if (err) q.reject(err);
  //       else q.resolve($);
  //     });
  //   });
  //   return q.promise;

  // }

  function safeGetDataFromTag(selector) {
    try {
      return selector();
    }
    catch (err) {
      return null;
    }
  }

  var scrape = function (req, res) {
    var uri = decodeURIComponent(req.query.q);
    if (!uri) res.send(Utils.ngSafe(""));
    Utils.fetchUri(uri).then(function (data) {
      var $ = cheerio.load(data);
      // Priorities:
      // Header
      // 1. <title>
      // 2. <meta property="og:title" content="" />
      // 3. <meta name="og:title" content="" />

      // Description
      // 1. <meta name="description" content="" />
      // 2. <meta property="og:description" content="" />
      // 3. <meta name="og:description" content="" />"

      // console.log($('meta[property="og:title"]')[0].attribs.content);

      var title1 = safeGetDataFromTag(function () { return $('title').text(); });
      var title2 = safeGetDataFromTag(function () { return $('meta[property="og:title"]')[0].attribs.content; });
      var title3 = safeGetDataFromTag(function () { return $('meta[name="og:title"]')[0].attribs.content; });

      var desc1 = safeGetDataFromTag(function () { return $('meta[name="description"]')[0].attribs.content; });
      var desc2 = safeGetDataFromTag(function () { return $('meta[property="og:description"]')[0].attribs.content; });
      var desc3 = safeGetDataFromTag(function () { return $('meta[name="og:description"]')[0].attribs.content; });

      var obj = {
        title1: title1,
        title2: title2,
        title3: title3,

        desc1: desc1,
        desc2: desc2,
        desc3: desc3
      };
      res.send(Utils.ngSafe(obj));
    }, function (err) {
      res.send(Utils.ngSafe(err));
    });
  };

  function routes(app) {
    app.get('/api/scrape', Utils.ensureAuthenticated, scrape);
  }

  module.exports = {
    routes: routes
  }
}());

    // Nodeio.scrape(function() {
    //   this.getHtml(req.query.q, function(err, $) {
    //     console.log($('title').text);
    //     $('h1').each(function(elm) { console.log(elm); });
    //   });
    // });
