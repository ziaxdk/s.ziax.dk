describe("module directives", function() {
  beforeEach(module('s.ziax.dk.tests'));

  describe("z-input-button", function() {
    var scope;

    beforeEach(inject(function($injector) {
      scope = $injector.get('$rootScope');
    }));
   
    afterEach(function() {
      scope.$destroy();
    });

    // Styling
    it('should contain 1 element when clicking button and should have "btn-primary" class applied ', inject(function ($compile) {
      var html = '<div z-input-button="selected" z-input-button-data="{{data}}"></div>';
      scope.data = [{id: 1}, {id: 2}];
      var element = $($compile(html)(scope));
      scope.$digest();
      
      $('button:first', element).click();
      expect($('button:first', element)).toHaveClass('btn-primary');
      expect($('button:last', element)).toHaveClass('btn-default');
    }));

    // Array
    it('should contain 2 elements when providing an array', inject(function ($compile) {
      var html = '<div z-input-button="selected" z-input-button-data="{{data}}"></div>';
      scope.data = [{id: 1}, {id: 2}];
      var element = $($compile(html)(scope));
      scope.$digest();
      
      expect($('button', element)).toHaveLength(2);
      expect(scope.selected).toHaveLength(0);
    }));
    it('should contain 2 elements when providing an array with select all', inject(function ($compile) {
      var html = '<div z-input-button="selected" z-input-button-data="{{data}}" z-input-button-select-all="true"></div>';
      scope.data = [{id: 1}, {id: 2}];
      var element = $($compile(html)(scope));
      scope.$digest();
      
      expect($('button', element)).toHaveLength(2);
      expect(scope.selected).toHaveLength(2);
      expect(scope.selected[0]).not.toBeUndefined();
      expect(scope.selected[0]).toBe(1);
    }));
    // it('should contain 2 elements when providing an array', inject(function ($compile) {
    //   var html = '<div z-input-button="selected" z-input-button-data="{{data}}" z-input-button-selector="{key: 'term'}"></div>';
    //   scope.data = [{id: 1}, {id: 2}];
    //   var element = $($compile(html)(scope));
    //   scope.$digest();
      
    //   expect($('button', element)).toHaveLength(2);
    //   expect(scope.selected).toHaveLength(0);
    // }));

    // Object
    it('should contain 2 elements when providing an object', inject(function ($compile) {
      var html = '<div z-input-button="selected" z-input-button-data="{{data}}"></div>';
      scope.data = { no1: 'no1', no2: 'no2' };
      var element = $($compile(html)(scope));
      scope.$digest();
      
      expect($('button', element)).toHaveLength(2);
      expect(scope.selected).toHaveLength(0);
    }));
    iit('should contain 2 elements when providing an array with select all', inject(function ($compile) {
      var html = '<div z-input-button="selected" z-input-button-data="{{data}}" z-input-button-select-all="true"></div>';
      scope.data = { no1: 'no1', no2: 'no2' };
      var element = $($compile(html)(scope));
      scope.$digest();
      
      // expect($('button', element)).toHaveLength(2);
      // expect(scope.selected).toHaveLength(2);
      // expect(scope.selected[0]).not.toBeUndefined();
    }));

  });
});