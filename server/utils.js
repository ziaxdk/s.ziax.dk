(function () {
  var util = require('util'),
      request = require('request'),
      Q = require('q');

  var isProd = function () {
    return (process.env.NODE_ENV || 'development') == 'production';
  };

  var ensureAdminAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    if (req.user.isAdmin) { return next(); }
    res.status(403);
    res.send();
  };

  var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    // res.redirect('/loginerr');
    res.status(403);
    res.send();
  };

  function log(obj) {
    util.log(util.inspect(obj, { depth: null, colors: true }));
  }

  function check (val) {
    if (!val || val === null) return false;
    return toString.apply(val) == '[object Array]' || typeof val == 'object' ;
  }

  function ngPrivate (obj) {
    for (var key in obj) {
      var val = obj[key];
      if (obj.hasOwnProperty(key)) {
        if (check(val)) ngPrivate(val);
      }
      if (key.indexOf('_', 0) === 0) {
        var newkey = key.substring(1);
        if (obj[newkey]) {
          throw Error(newkey + ' exists');
        }
        obj[newkey] = val;
        delete obj[key];
      }
    }
    return obj;
  }
  function ngSafe (val) {
    return ")]}',\n" + JSON.stringify(ngPrivate(val)); // Angular 1.2.0
    // return ")]}',\n" + JSON.stringify(val);
  }

  // function validateCode (code) {
  //   var d = new Date();
  //   var val = d.getDate() + '' + d.getDate();
  //   console.log(code, val);
  //   return val === code;
  // }

  function fetchUri(url) {
    var q = Q.defer();

    request(url, function (error, response, body) {
      if (error || response.statusCode !== 200) q.reject(err);
      q.resolve(body);
    });
    return q.promise;
  }





  var obj = {
    log: log,
    ngSafe: ngSafe,
    // validateCode: validateCode,
    ensureAuthenticated: ensureAuthenticated,
    ensureAdminAuthenticated: ensureAdminAuthenticated,
    fetchUri: fetchUri,
    isProd: isProd
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = obj;
  }
  else {
    root.utils = obj;
  }

}());
