module.directive('ngFocusBlurClass', [function () {
  return function(scope, element, attrs) {
    element.on('focus', function () {
      element.addClass(attrs.ngFocusBlurClass || 'ngFocus');
    })
    element.on('blur', function () {
      element.removeClass(attrs.ngFocusBlurClass || 'ngFocus');
    })
  };
}]);
