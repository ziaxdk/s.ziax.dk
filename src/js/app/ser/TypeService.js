module.service('TypeService', [function () {
  var _types = [
    {
      name: 'article',
      template: 'html/_new_article.html',
      preview: true,
      storeFn: function() {
        return {
          header: this.input,
          content: this.content
        };
      },
      fetchFn: function(data) {
        this.input = data.header;
        this.content = data.content;
      }
    },
    {
      name: 'link',
      template: 'html/_new_link.html',
      preview: true,
      storeFn: function() {
        return {
          url: this.input,
          header: this.header,
          content: this.content
        };
      },
      fetchFn: function(data) {
        this.input = data.url;
        this.header = data.header;
        this.content = data.content;
      }
    }
    // {
    //   name: '_name_',
    //   template: 'html/_new_(name).html',
    //   preview: true,
    //   storeFn: function() {
    //   },
    //   fetchFn: function(data) {
        
    //   }
    // }
  ];

  function getType (name) {
    for (var i = _types.length - 1; i >= 0; i--) {
      if (_types[i].name === name) return _types[i];
    }
  }
  return {
    getType: getType
  };
}]);
