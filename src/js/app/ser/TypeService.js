module.service('TypeService', ['$http', function ($http) {
  var _types = [
    {
      name: 'article',
      template: 'html/_new_article.html',
      preview: true,
      storeFn: function(form) {
        return {
          header: form.input,
          content: form.content
        };
      }
    },
    {
      name: 'link',
      template: 'html/_new_link.html',
      preview: true,
      storeFn: function() {
        
      }
    }
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
