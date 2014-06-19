describe('UnicodeRange', function () {
  var UnicodeRange = fontloader.UnicodeRange,
      Range = fontloader.Range;

  describe('#constructor', function () {
    it('parses single code point', function () {
      expect(new UnicodeRange('u+0').ranges, 'to equal', [new Range(0, 0)]);
      expect(new UnicodeRange('u+f').ranges, 'to equal', [new Range(15, 15)]);
    });

    it('parses single code point with wildcards', function () {
      expect(new UnicodeRange('u+0?').ranges, 'to equal', [new Range(0, 15)]);
    });

    it('parses a range', function () {
      expect(new UnicodeRange('u+00-ff').ranges, 'to equal', [new Range(0, 255)]);
    });

    it('parses multiple ranges with single code points', function () {
      expect(new UnicodeRange('u+0,u+f').ranges, 'to equal', [new Range(0, 0), new Range(15, 15)]);
    });

    it('parses multiple ranges with single wildcard code points', function () {
      expect(new UnicodeRange('u+0?,u+f?').ranges, 'to equal', [new Range(0, 15), new Range(240, 255)]);
    });

    it('parses multiple ranges with ranges', function () {
      expect(new UnicodeRange('u+00-ff,u+ff-fff').ranges, 'to equal', [new Range(0, 255), new Range(255, 4095)]);
    });

    it('throws on invalid ranges', function () {
      expect(function () {
        new UnicodeRange('');
      }, 'to throw exception');

      expect(function () {
        new UnicodeRange('not a range');
      }, 'to throw exception');

      expect(function () {
        new UnicodeRange('u+ffffffffffff');
      }, 'to throw exception');

      expect(function () {
        new UnicodeRange('u+ff-');
      }, 'to throw exception');
    });
  });

  describe('parse', function () {
    it('parses an ASCII string', function () {
      expect(UnicodeRange.parse('hello').toString(), 'to equal', 'u+65,u+68,u+6c,u+6f');
      expect(UnicodeRange.parse('1').toString(), 'to equal', 'u+31');
    });

    it('parses a BMP string', function () {
      expect(UnicodeRange.parse('中国').toString(), 'to equal', 'u+4e2d,u+56fd');
    });

    it('parses surrogate pairs', function () {
      expect(UnicodeRange.parse('a\uD834\uDF06bc').toString(), 'to equal', 'u+61,u+62,u+63,u+1d306');
    });
  });

  describe('#encodeCodePoint', function () {
    var unicodeRange = null;

    beforeEach(function () {
      unicodeRange = new UnicodeRange('u+0');
    });

    it('should encode ASCII safe characters as themselves', function () {
      expect(unicodeRange.encodeCodePoint(65), 'to equal', 'A');
      expect(unicodeRange.encodeCodePoint(57), 'to equal', '9');
      expect(unicodeRange.encodeCodePoint(97), 'to equal', 'a');
    });

    it('should encode control characters correctly', function () {
      expect(unicodeRange.encodeCodePoint(0), 'to equal', '\u0000');
      expect(unicodeRange.encodeCodePoint(127), 'to equal', '\u007f');
    });

    it('should always encode code points in the BMP that are not safe', function () {
      expect(unicodeRange.encodeCodePoint(20013), 'to equal', '\u4e2d');
      expect(unicodeRange.encodeCodePoint(22269), 'to equal', '\u56fd');
    });

    it('should encode code points outside the BMP as surrogate pairs', function () {
      expect(unicodeRange.encodeCodePoint(119558), 'to equal', '\ud834\udf06');
      expect(unicodeRange.encodeCodePoint(0x10ffff), 'to equal', '\udbff\udfff');
    });
  });

  describe('#toTestString', function () {
    it('uses the default string when given the entire unicode range', function () {
      expect(new UnicodeRange('u+0-10ffff').toTestString(), 'to equal', 'BESbswy');
    });

    it('uses the first 7 characters from a custom range', function () {
      expect(new UnicodeRange('u+41-5a').toTestString(), 'to equal', 'ABCDEFG');
    });

    it('uses the first 7 characters from multiple custom ranges', function () {
      expect(new UnicodeRange('u+41,u+48,u+53-5a').toTestString(), 'to equal', 'AHSTUVW');
    });

    it('uses the first 7 characters or fewer', function () {
      expect(new UnicodeRange('u+41').toTestString(), 'to equal', 'A');
      expect(new UnicodeRange('u+41,u+48').toTestString(), 'to equal', 'AH');
    });

    it('returns an empty string when given only control characters', function () {
      expect(new UnicodeRange('u+00').toTestString(), 'to equal', '');
    });

    it('uses the first 7 characters when given a range including control characters', function () {
      expect(new UnicodeRange('u+0-ff').toTestString(), 'to equal', '!"#$%&\'');
    });

    it('uses BMP characters as test string', function () {
      expect(new UnicodeRange('u+4e2d,u+56fd').toTestString(), 'to equal', '\u4e2d\u56fd');
    });

    it('correctly generates surrogate pairs for characters outside the BMP', function () {
      expect(new UnicodeRange('u+1d306').toTestString(), 'to equal', '\ud834\udf06');
    });
  });

  describe('#toString', function () {
    it('serializes single code points', function () {
      expect(new UnicodeRange('u+ff').toString(), 'to equal', 'u+ff');
    });

    it('serializes wildcards by expanding them to ranges', function () {
      expect(new UnicodeRange('u+0?').toString(), 'to equal', 'u+0-f');
    });

    it('serializes ranges', function () {
      expect(new UnicodeRange('u+00-ff').toString(), 'to equal', 'u+0-ff');
    });

    it('serializes multiple ranges', function () {
      expect(new UnicodeRange('u+0,u+f').toString(), 'to equal', 'u+0,u+f');
    });
  });

  describe('#intersects', function () {
    it('returns true if at least one point intersects', function () {
      expect(new UnicodeRange('u+0').intersects(new UnicodeRange('u+0')), 'to be true');
      expect(new UnicodeRange('u+0-2').intersects(new UnicodeRange('u+2')), 'to be true');
    });

    it('returns false if there is no intersection', function () {
      expect(new UnicodeRange('u+0').intersects(new UnicodeRange('u+1')), 'to be false');
      expect(new UnicodeRange('u+0-5').intersects(new UnicodeRange('u+6')), 'to be false');
    });

    it('returns true if at least one point intersects in multiple ranges', function () {
      expect(new UnicodeRange('u+0,u+2').intersects(new UnicodeRange('u+2,u+0')), 'to be true');
      expect(new UnicodeRange('u+0-2,u+3').intersects(new UnicodeRange('u+3')), 'to be true');
    });

    it('returns false if there is no intersection in multiple ranges', function () {
      expect(new UnicodeRange('u+0,u+2').intersects(new UnicodeRange('u+1')), 'to be false');
    });
  });
});
