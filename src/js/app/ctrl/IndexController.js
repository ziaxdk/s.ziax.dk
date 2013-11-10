module.controller('IndexController', ['History', '$location',
  function (History, $location) {
  var _t = this;
  _t.history = History.data.facets.history.terms;
  

  _t.search = function (q) {
    $location.path('res/' +  encodeURIComponent(q.term));
  };
}]);
