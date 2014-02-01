module.factory('ApiTypeFactory', [function () {
  var apiType = function (type) {
    if (type === 'places') return {
      uri: '/api/places',
      type: 'places'
    };

    return {
      uri: '/api/xq',
      type: 'search'
    };
  };
  return apiType;
}]);
