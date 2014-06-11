describe('Range', function () {
  var Range = fontloader.Range;

  describe('#constructor', function () {
    it('creates a range', function () {
      expect(new Range(0, 10).start).to.eql(0);
      expect(new Range(0, 10).end).to.eql(10);
    });
  });

  describe('#toString', function () {
    it('serializes single code points', function () {
      expect(new Range(15, 15).toString()).to.eql('u+f');
    });

    it('serializes ranges', function () {
      expect(new Range(0, 255).toString()).to.eql('u+0-ff');
    });
  });

  describe('#contains', function () {
    it('contains a code point', function () {
      expect(new Range(0, 15).contains(0)).to.be(true);
      expect(new Range(0, 15).contains(7)).to.be(true);
      expect(new Range(0, 15).contains(15)).to.be(true);
    });

    it('does not contain a code point', function () {
      expect(new Range(1, 15).contains(0)).to.be(false);
      expect(new Range(1, 15).contains(16)).to.be(false);
      expect(new Range(1, 15).contains(200)).to.be(false);
    });
  });
});
