module.service('LeafletControlsService', [function () {

  var TagClass = L.Control.extend({
    options: {
      position: 'bottomright'
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
      var container = this._container = L.DomUtil.create('div', 'tags-control');
      angular.element(container).append(this._elements);
      return container;
    }
  });

  return {
    tagsControl: function(options) {
      return new TagClass(options);
    }
  };
}]);
