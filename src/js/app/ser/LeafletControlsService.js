module.service('LeafletControlsService', [function () {
  var LeafletControlClass = L.Control.extend({
    options: {
      position: 'topright'
    },
    
    initialize: function (options) {
      L.Util.setOptions(this, options);
      this._elements = options.html(options.scope);
    },

    onAdd: function() {
      this._initLayout();
      return this._container;
    },

    _initLayout: function () {
      var container = this._container = L.DomUtil.create('div', this.options.className);
      angular.element(container).append(this._elements);
      return container;
    }
  });

  return {
    leafletControl: function(options) {
      return new LeafletControlClass(options);
    }
  };
}]);
