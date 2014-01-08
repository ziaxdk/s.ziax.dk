module.service('PlaceService', [function () {
  function each(cb) {
    var len = poi.length;
    while (len--) {
      if (cb(poi[len])) return poi[len];
    }
  };

  var poi = [
      { name: 'cutlery', type: 'cutlery', color: 'cadetblue', title: 'Restaurant' },
      { name: 'coffee', type: 'coffee', color: 'darkred', title: 'Coffee' },
      { name: 'shopping-cart', type: 'shopping-cart', color: 'darkgreen', title: 'Shopping' },
      { name: 'eye', type: 'eye', color: 'blue', title: 'Viewpoint' },
      { name: 'camera', type: 'camera', color: 'orange', title: 'Photography' },
      { name: 'home', type: 'home', color: 'red', title: 'Hotel' }
    ],
  getPoi = function (name) {
    return each(function (poi) { return poi.name === name });
  };


  return {
    poi: poi,
    getPoi: getPoi

  };
}]);
