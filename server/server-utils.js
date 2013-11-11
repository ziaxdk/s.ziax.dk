module.exports = function () {
  var check = function (val) {
    if (!val || val === null) return false;
    return toString.apply(val) == '[object Array]' || typeof val == 'object' ;
  };

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

  return {
    ngPrivateRemover: ngPrivate
  };
};
