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

  describe('#intersects', function () {
    function test(startA, endA, startB, endB) {
      return new Range(startA, endA).intersects(new Range(startB, endB));
    }

    it('returns true on intersections', function () {
      expect(test(0, 1,  0, 1)).to.be(true);
      expect(test(0, 10, 0, 1)).to.be(true);
      expect(test(0, 1, 0, 10)).to.be(true);
      expect(test(0, 1, 1, 2)).to.be(true);
      expect(test(1, 2, 0, 1)).to.be(true);
    });

    it('returns false when ranges do not intersect', function () {
      expect(test(0, 1, 2, 3)).to.be(false);
      expect(test(2, 3, 0, 1)).to.be(false);
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
