describe("module directives", function() {
  beforeEach(module('s.ziax.dk.tests'));

  describe("s", function() {

    var scope,
      html = '<div z-input-button="selected" z-input-button-data="{{data}}"></div>';

    beforeEach(inject(function($injector) {
      scope = $injector.get('$rootScope');
    }));
   
    afterEach(function() {
      scope.$destroy();
    });


    it('should expand when clicked', inject(function ($compile) {
      scope.data = [{id: 1}, {id: 2}];
      var element = $($compile(html)(scope));
      scope.$digest();
      
      expect($('button', element)).toHaveLength(2);
      expect(scope.selected).toHaveLength(0);
      // expect($('li', element)).toHaveLength(2);
      // expect($('li:nth-child(1) > i', element)).toHaveClass('glyphicon-chevron-right');
      // expect($('li:nth-child(2)', element)).toContainElement('div.test-ng-transclude');
      // expect($('li:nth-child(2)', element)).toHaveClass('ng-hide');

      // $('li:nth-child(1)', element).click();

      // expect($('li:nth-child(1) > i', element)).toHaveClass('glyphicon-chevron-down');
      // expect($('li:nth-child(2)', element)).not.toHaveClass('ng-hide');
    }));


  });
});