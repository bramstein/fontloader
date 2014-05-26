describe('CssValue', function () {
  var CssValue = fontloader.CssValue;

  describe('Parsers', function () {
    var parsers = CssValue.Parsers;

    it('parses family correctly', function () {
      expect(parsers.FAMILY('myfamily')).to.eql('myfamily');
      expect(parsers.FAMILY('my-family')).to.eql('my-family');
      expect(parsers.FAMILY('My Family')).to.eql('My Family');
      expect(parsers.FAMILY('Red/Black')).to.eql(null);
      expect(parsers.FAMILY('Ahem!')).to.eql(null);
      expect(parsers.FAMILY('test@foo')).to.eql(null);
      expect(parsers.FAMILY('#POUND')).to.eql(null);
      expect(parsers.FAMILY('Hawaii 5-0')).to.eql(null);
      expect(parsers.FAMILY('$42')).to.eql(null);
      expect(parsers.FAMILY('Red\\/Black')).to.eql('Red\\/Black');
      expect(parsers.FAMILY('Lucida     Grande')).to.eql('Lucida Grande');
      expect(parsers.FAMILY('Ahem\\!')).to.eql('Ahem\\!');
      expect(parsers.FAMILY('\\$42')).to.eql('\\$42');
      expect(parsers.FAMILY('€42')).to.eql('€42');
    });

    it('parses style correctly', function () {
      expect(parsers.STYLE('italic')).to.eql('italic');
      expect(parsers.STYLE('oblique')).to.be('oblique');
      expect(parsers.STYLE('normal')).to.eql('normal');
      expect(parsers.STYLE('Italic')).to.eql(null);
      expect(parsers.STYLE('bold')).to.eql(null);
      expect(parsers.STYLE('italics')).to.eql(null);
      expect(parsers.STYLE('nitalics')).to.eql(null);
    });

    it('parses weight correctly', function () {
      expect(parsers.WEIGHT('bold')).to.eql('bold');
      expect(parsers.WEIGHT('bolder')).to.eql('bolder');
      expect(parsers.WEIGHT('lighter')).to.eql('lighter');
      expect(parsers.WEIGHT('100')).to.eql('100');
      expect(parsers.WEIGHT('200')).to.eql('200');
      expect(parsers.WEIGHT('300')).to.eql('300');
      expect(parsers.WEIGHT('400')).to.eql('400');
      expect(parsers.WEIGHT('500')).to.eql('500');
      expect(parsers.WEIGHT('600')).to.eql('600');
      expect(parsers.WEIGHT('700')).to.eql('700');
      expect(parsers.WEIGHT('800')).to.eql('800');
      expect(parsers.WEIGHT('900')).to.eql('900');
      expect(parsers.WEIGHT('1000')).to.eql(null);
      expect(parsers.WEIGHT('light')).to.eql(null);
      expect(parsers.WEIGHT('nbolds')).to.eql(null);
    });

    it('parses stretch correctly', function () {
      expect(parsers.STRETCH('ultra-condensed')).to.eql('ultra-condensed');
      expect(parsers.STRETCH('extra-condensed')).to.eql('extra-condensed');
      expect(parsers.STRETCH('semi-condensed')).to.eql('semi-condensed');
      expect(parsers.STRETCH('ultra-expanded')).to.eql('ultra-expanded');
      expect(parsers.STRETCH('extra-expanded')).to.eql('extra-expanded');
      expect(parsers.STRETCH('semi-expanded')).to.eql('semi-expanded');
      expect(parsers.STRETCH('condensed')).to.eql('condensed');
      expect(parsers.STRETCH('expanded')).to.eql('expanded');
      expect(parsers.STRETCH('normal')).to.eql('normal');
      expect(parsers.STRETCH('bold')).to.eql(null);
      expect(parsers.STRETCH('')).to.eql(null);
    });

    it('parses unicodeRange correctly', function () {
      expect(parsers.UNICODE_RANGE('u+ff').toString()).to.eql('u+ff');
      expect(parsers.UNICODE_RANGE('U+Ff').toString()).to.eql('u+ff');
      expect(parsers.UNICODE_RANGE('U+F?').toString()).to.eql('u+f0-ff');
      expect(parsers.UNICODE_RANGE('U+AA-FF').toString()).to.eql('u+aa-ff');
      expect(function () {
        parsers.UNICODE_RANGE('U+FF-');
      }).to.throwException();
      expect(function () {
        parsers.UNICODE_RANGE('U+FFFFFFFFF')
      }).to.throwException();
      expect(parsers.UNICODE_RANGE('u+AA,u+AB').toString()).to.eql('u+aa,u+ab');
    });

    it('parses variant correctly', function () {
      expect(parsers.VARIANT('small-caps')).to.eql('small-caps');
      expect(parsers.VARIANT('normal')).to.eql('normal');
    });
  });
});
