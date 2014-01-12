(function () {

  var obj = {
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = obj;
  }
  else {
    root.utils = obj;
  }
}());
