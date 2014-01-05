(function () {
  var utils = require('./utils2');

  function callback (args) {
    return function (err, data) {
      if (err) {
        console.log(err);
        return args[2](err);
      }
      args[1].send(utils.ngSafe(data));
    }
  }

  module.exports = {
    callback: callback,
    types: ['link', 'place', 'article'],
    index: 'ziax'
  };
}());