module.service('PlaceService', [function () {
  function each (cb) {
    var len = poi.length;
    while (len--) {
      if (cb(poi[len])) return poi[len];
    }
  };

  var poi = [
      { name: 'cutlery', color: 'cadetblue', title: 'Restaurant' },
      { name: 'coffee', color: 'darkred', title: 'Coffee' },
      { name: 'shopping-cart', color: 'darkgreen', title: 'Shopping' },
      { name: 'eye', color: 'blue', title: 'Viewpoint' },
      { name: 'camera', color: 'orange', title: 'Photography' },
      { name: 'home', color: 'red', title: 'Hotel' }
    ],
  getPoi = function (name) {
    return each(function (poi) { return poi.name === name });
  };


  return {
    poi: poi,
    getPoi: getPoi

  };
}]);
