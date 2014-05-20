module.factory('DelayerFactory', ['$timeout', function ($timeout) {
  var delayer = function (delayInMs) {
    var canceler;
    return {
      run: function (actionToExecute) {
        if (canceler) $timeout.cancel(canceler);
        canceler = $timeout(actionToExecute, delayInMs);
      },
      cancel: function() {
        if (!canceler) return;
        $timeout.cancel(canceler);
        canceler = undefined;
      }
    };
  };
  return delayer;
}]);
