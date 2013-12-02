(function () {
  var shell = require('shelljs');
  var theExport = {

    extend: function (a, b) {
      for(var key in b)
        if(b.hasOwnProperty(key)) a[key] = b[key];
      return a;
    },
    getHash: function () {
      var hash = shell.exec('git rev-parse --short HEAD', { silent: true }).output.replace('\n', '');
      return hash;
    }
  };

  module.exports = theExport;
}());