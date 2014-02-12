module.controller('ShowController', ['Result', '$http', '$location', function (Result, $http, $location) {
  this.Result = Result.data;

  this.edit = function(hit) {
    $location.path('/edit/' + encodeURIComponent(hit.type) + '/' + encodeURIComponent(hit.id));
     // console.log('edit', hit);
  };
}]);
