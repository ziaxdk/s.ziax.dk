describe('bum', function() {
  beforeEach(function() {
    // browser.get('http://s.ziax.dk');
    browser.get('http://localhost:8081');
  });
 
  it('should title bum', function() {
    expect( element(by.tagName('title')).getInnerHtml() ).toEqual('SearcH!');
  });
});