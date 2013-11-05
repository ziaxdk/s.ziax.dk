module.filter('textile', ['$sce', function ($sce) {
  return function (val) {
    return !val ? "" : $sce.trustAsHtml(textile.parse(val));
  };
}]);
