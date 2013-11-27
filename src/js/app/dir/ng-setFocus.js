module.directive('ngSetFocus', [function () {
  return function (scope, element, attrs) {
    element[0].focus();
  };
}]);
