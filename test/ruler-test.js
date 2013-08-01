describe('fontloader.Ruler', function () {
  var Ruler = fontloader.Ruler;

  describe('#constructor', function () {
    var r = null;

    beforeEach(function () {
      r = new Ruler('test');
    });

    it('creates a valid ruler', function () {
      expect(r).not.to.be(null);
      expect(r.el.nodeName).to.eql('SPAN');
    });

    it('sets the test string correctly', function () {
      expect(r.el.innerHTML).to.eql('test');
    });

    it('is not be inserted into the DOM', function () {
      expect(r.el.parentNode).to.be(null);
    });
  });

  describe('#insert', function () {
    it('inserts the element into the DOM', function () {
      var r = new Ruler('test');
      r.insert();
      expect(r.el.parentNode).not.to.be(null);
      r.remove();
    });
  });

  describe('#remove', function () {
    it('removes the element from the DOM', function () {
      var r = new Ruler('test');
      r.insert();
      expect(r.el.parentNode).not.to.be(null);
      r.remove();
      expect(r.el.parentNode).to.be(null);
    });
  });

  describe('#getWidth', function () {
    it('returns the width of the ruler', function () {
      var r = new Ruler('test');
      expect(r.getWidth()).to.eql(0);
      r.insert();
      expect(r.getWidth()).not.to.eql(0);
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
      expect(r.el.style['lineHeight']).to.eql('150px');
    });

    it('overrides style properties necessary to properly measure', function () {
      r.setStyle({ 'font-size': '12px' });
      expect(r.el.style['fontSize']).to.eql('300px');
    });
  });
});
