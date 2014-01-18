module.directive('zPopoverIframe', ['$parse', '$document', '$compile', '$timeout', function ($parse, $document, $compile, $timeout) {
  return {
    restrict: 'A',
    replace: false,
    scope: true,
    compile: function() {
      var tmpl = $compile('<div class="popover" style="display: block; position: absolute; top: 60px; bottom: 40px; left: 10px; right: 10px; max-width: none">' +
        '<div class="popover-content" style="height: 100%">' +
          '<iframe ng-src="{{url}}" style="width: 100%; height: 100%"></iframe>' +
        '</div>' +
      '</div>');

      return function link ( scope, element, attrs ) {
        var popup, timeout;

        var url = $parse(attrs.zPopoverIframe)(scope)
          , delay = $parse(attrs.zPopoverIframeDelay)(scope);

        element.on('mouseenter', function () {
          if (timeout) $timeout.cancel(timeout);
          timeout = $timeout(function () {
            timeout = null;
            if (popup) popup.remove();
            popup = tmpl(scope, function () {});
            popup.on('mouseleave', function() {
              popup.remove();
              popup = null;
            });
            $document.find( 'body' ).append( popup );
            scope.url = url;
          }, delay || 1000);
        });

        element.on('mouseleave', function() {
          if (timeout) {
            $timeout.cancel(timeout);
          }
        });
      };
    }
  };
}]);
