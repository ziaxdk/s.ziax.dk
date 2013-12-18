module.filter('html', ['$sce', function ($sce) {
  return function (val, len, moreChars) {
    if (!val) return "";
    len = !angular.isNumber(len) ? 10 : len
    moreChars = !angular.isDefined(moreChars) ? '...' : moreChars;
    val = val.toString().replace(/<[^>]*>/g, '');
    if (val.length <= len) return val;
    return val.substring(0, len) + moreChars;
  };
}]);
