module.directive('zSelect2', [function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    template: '<input type="hidden" class="form-control" />',
    replace: true,
    link: function(scope, element, attrs, ngModel) {
      scope.$watch(attrs.zSelect2, function(val) {
        var temp = [];
        angular.forEach(val, function(e) {
          temp.push(e.term);
        });
        element.select2({
          tags: temp,
          multiple: true
        }).on('change', function(evt) {
          ngModel.$setViewValue(evt.val);
        });
      });
      scope.$on('$destroy', function() {
        element.select2('destroy');
      });
    }
  };
}]);
