module.factory('AsyncJsFactory', [ '$q', '$timeout',  function ( $q, $timeout ) {
  // var delayer = function (delayInMs) {
  //   var canceler;
  //   return {
  //     run: function (actionToExecute) {
  //       if (canceler) $timeout.cancel(canceler);
  //       canceler = $timeout(actionToExecute, delayInMs);
  //     }
  //   };
  // };
  // return delayer;
  // 
  
  var ctor = function(url, isLoaded) {
    var deferred = $q.defer(),
        script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0];

    if (isLoaded) {
      deferred.resolve(true);
      return;
    }

    script.src = url;
    script.onerror = function() { deferred.resolve(false); };
    script.onload = script.onreadystatechange = function() {
      // var rs = this.readyState;
      // if (rs && rs != 'complete' && rs != 'loaded') {
      //   deferred.resolve(false);
      //   return;
      // }
      deferred.resolve(true);
    };
    head.appendChild(script);

    return deferred.promise;
  };
  return ctor;
}]);
