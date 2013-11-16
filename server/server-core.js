module.exports = function (esClient, app) {
  var Drive = require('./server-api-drive.js'),
      Q =  require('./server-api-q.js'),
      exQ =  require('./server-api-exq.js'),
      His =  require('./server-api-history.js'),
      Suggest =  require('./server-api-suggest.js'),
      Misc =  require('./server-api-misc.js'),

      Utils = require('./server-utils')()
      ;

  // Locals


  var self = {}, INDEX = "ziax";

  self.INDEX = "ziax";

  self.ensureAuthenticated =  function (req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/loginerr');
  };

  self.ngSafe = function (val) {
    return ")]}',\n" + JSON.stringify(Utils.ngPrivateRemover(val)); // Angular 1.2.0
    // return ")]}',\n" + JSON.stringify(val);
  }

  self.escallback = function (req, res) {
    return function (err, data) {
      if (err) {
        console.log(err);
        res.send(self.ngSafe("err"));
        return;
      }
      res.send(self.ngSafe(data));
    };
  };

  Drive(esClient, app, self);
  Q(esClient, app, self);
  exQ(esClient, app, self);
  His(esClient, app, self);
  Suggest(esClient, app, self);
  Misc(esClient, app, self);


  // // Api
  // app.get('/api/debug', function (req, res) {
  //   res.send(ngSafe("debug"));
  // });

  app.get('/api/me', self.ensureAuthenticated, function (req, res) {
    res.send(self.ngSafe(req.user));
  });



  // var parent = function () { };
  // parent.prototype.fun = function(first_argument) {
  //   console.log('// body...');
  // };

  // var child = function () {};
  // child.prototype = new parent();



  // var i = new child();
  // i.fun();

  return self;
};