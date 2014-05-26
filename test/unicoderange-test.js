describe('UnicodeRange', function () {
  var UnicodeRange = fontloader.UnicodeRange;

  describe('#constructor', function () {
    it('parses single code point', function () {
      expect(new UnicodeRange('u+0').start).to.eql(0);
      expect(new UnicodeRange('u+0').end).to.eql(0);
      expect(new UnicodeRange('u+f').start).to.eql(15);
    });

    it('parses single code point with wildcards', function () {
      expect(new UnicodeRange('u+0?').start).to.eql(0);
      expect(new UnicodeRange('u+f?').end).to.eql(255);
    });

    it('parses a range', function () {
      expect(new UnicodeRange('u+00-ff').start).to.eql(0);
      expect(new UnicodeRange('u+00-ff').end).to.eql(255);
    });
  });

  describe('#toString', function () {
    it('serializes single code points', function () {
      expect(new UnicodeRange('u+ff').toString()).to.eql('u+ff');
    });

    it('serializes wildcards by expanding them to ranges', function () {
      expect(new UnicodeRange('u+0?').toString()).to.eql('u+0-f');
    });

    it('serializes ranges', function () {
      expect(new UnicodeRange('u+00-ff').toString()).to.eql('u+0-ff');
    });
  });
});
