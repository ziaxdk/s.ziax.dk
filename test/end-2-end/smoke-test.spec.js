describe('bum', function() {
  beforeEach(function() {
    // browser.get('http://s.ziax.dk');
    console.log(this);
    browser.get('http://s.ziax.dk');
  });
 
  it('should title bum', function() {
    expect( element(by.tagName('title')).getInnerHtml() ).toEqual('SearcH!');
  });
});