describe('Ruler', function () {
  var Ruler = fontloader.Ruler;

  describe('#constructor', function () {
    var r = null;

    beforeEach(function () {
      r = new Ruler('test');
    });

    it('creates a valid ruler', function () {
      expect(r, 'not to be null');
      expect(r.el.nodeName, 'to equal', 'SPAN');
    });

    it('sets the test string correctly', function () {
      expect(r.el.innerHTML, 'to equal', 'test');
    });
  });

  describe('#insert', function () {
    it('inserts the element into the DOM', function () {
      var r = new Ruler('test');
      r.insert();
      expect(r.el.parentNode, 'not to be null');
      r.remove();
    });
  });

  describe('#remove', function () {
    it('removes the element from the DOM', function () {
      var r = new Ruler('test');
      r.insert();
      expect(r.el.parentNode, 'not to be null');
      var parentNode = r.el.parentNode;
      r.remove();
      expect(r.el.parentNode, 'not to be', parentNode);
    });
  });

  describe('#getWidth', function () {
    it('returns the width of the ruler', function () {
      var r = new Ruler('test');
      expect(r.getWidth(), 'to equal', 0);
      r.insert();
      expect(r.getWidth(), 'not to equal', 0);
      r.remove();
    });
  });

  describe('#setStyle', function () {
    var r = null;

    beforeEach(function () {
      r = new Ruler('test');
    });

    it('sets the style correctly', function () {
      r.setStyle({ 'line-height': '150px' });
      expect(r.el.style['lineHeight'], 'to equal', '150px');
    });

    it('overrides style properties necessary to properly measure', function () {
      r.setStyle({ 'font-size': '12px' });
      expect(r.el.style['fontSize'], 'to equal', '300px');
    });
  });
});
