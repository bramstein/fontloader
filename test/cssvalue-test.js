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

  describe('serialize', function () {
    it('serializes an empty value', function () {
      expect(CssValue.serialize({})).to.eql('');
    });

    it('serializes a single property', function () {
      expect(CssValue.serialize({
        'font-size': '12px'
      })).to.eql('font-size:12px');
    });

    it('serializes multiple properties', function () {
      expect(CssValue.serialize({
        'font-size': '12px',
        'line-height': '16px'
      })).to.eql('font-size:12px;line-height:16px');
    });

    it('serializes a property with multiple values', function () {
      expect(CssValue.serialize({
        'font-family': ['Arial', 'Verdana', 'sans-serif']
      })).to.eql('font-family:Arial,Verdana,sans-serif');
    });
  });

  describe('parse', function () {
    it('returns null on invalid css font values', function () {
      expect(CssValue.parse('')).to.eql(null);
      expect(CssValue.parse('Arial')).to.eql(null);
      expect(CssValue.parse('12px')).to.eql(null);
      expect(CssValue.parse('12px/16px')).to.eql(null);
      expect(CssValue.parse('bold 12px/16px')).to.eql(null);
    });

    it('ignores non-terminated strings', function () {
      expect(CssValue.parse('12px "Comic')).to.eql(null);
      expect(CssValue.parse('12px "Comic, serif')).to.eql(null);
      expect(CssValue.parse("12px 'Comic")).to.eql(null);
      expect(CssValue.parse("12px 'Comic, serif")).to.eql(null);
    });

    it('parses a simple font specification correctly', function () {
      expect(CssValue.parse('12px serif')).to.eql({ 'font-size': '12px', 'font-family': ['serif'] });
    });

    it('returns multiple font families', function () {
      expect(CssValue.parse('12px Arial, Verdana, serif')).to.eql({ 'font-size': '12px', 'font-family': ['Arial', 'Verdana', 'serif'] });
    });

    it('handles quoted family names correctly', function () {
      expect(CssValue.parse('12px "Times New Roman"')).to.eql({ 'font-size': '12px', 'font-family': ['"Times New Roman"'] });
      expect(CssValue.parse("12px 'Times New Roman'")).to.eql({ 'font-size': '12px', 'font-family': ["'Times New Roman'"] });

      expect(CssValue.parse('12px "Times\\\' New Roman"')).to.eql({ 'font-size': '12px', 'font-family': ["\"Times\\\' New Roman\""] });
      expect(CssValue.parse("12px 'Times\\\" New Roman'")).to.eql({ 'font-size': '12px', 'font-family': ['\'Times\\\" New Roman\''] });

      expect(CssValue.parse('12px "Times\\\" New Roman"')).to.eql({ 'font-size': '12px', 'font-family': ['"Times\\\" New Roman"'] });
      expect(CssValue.parse("12px 'Times\\\' New Roman'")).to.eql({ 'font-size': '12px', 'font-family': ["'Times\\\' New Roman'"] });
    });

    it('handles unquoted identifiers correctly', function () {
      expect(CssValue.parse('12px Times New Roman')).to.eql({ 'font-size': '12px', 'font-family': ['Times New Roman'] });
      expect(CssValue.parse('12px Times New Roman, Comic Sans MS')).to.eql({ 'font-size': '12px', 'font-family': ['Times New Roman', 'Comic Sans MS'] });
    });

    // Examples taken from: http://mathiasbynens.be/notes/unquoted-font-family
    it('correctly returns null on invalid identifiers', function () {
      expect(CssValue.parse('12px Red/Black')).to.eql(null);
      expect(CssValue.parse("12px 'Lucida' Grande")).to.eql(null);
      expect(CssValue.parse('12px Ahem!')).to.eql(null);
      expect(CssValue.parse('12px Hawaii 5-0')).to.eql(null);
      expect(CssValue.parse('12px $42')).to.eql(null);
    });

    it('correctly parses escaped characters in identifiers', function () {
      expect(CssValue.parse('12px Red\\/Black')).to.eql({ 'font-size': '12px', 'font-family': ['Red\\/Black'] });
      expect(CssValue.parse('12px Lucida    Grande')).to.eql({ 'font-size': '12px', 'font-family': ['Lucida Grande'] });
      expect(CssValue.parse('12px Ahem\\!')).to.eql({ 'font-size': '12px', 'font-family': ['Ahem\\!'] });
      expect(CssValue.parse('12px \\$42')).to.eql({ 'font-size': '12px', 'font-family': ['\\$42'] });
      expect(CssValue.parse('12px €42')).to.eql({ 'font-size': '12px', 'font-family': ['€42'] });
    });

    it('correctly parses font-size', function () {
      expect(CssValue.parse('12px serif')).to.eql({ 'font-size': '12px', 'font-family': ['serif'] });
      expect(CssValue.parse('xx-small serif')).to.eql({ 'font-size': 'xx-small', 'font-family': ['serif'] });
      expect(CssValue.parse('s-small serif')).to.eql({ 'font-size': 's-small', 'font-family': ['serif'] });
      expect(CssValue.parse('small serif')).to.eql({ 'font-size': 'small', 'font-family': ['serif'] });
      expect(CssValue.parse('medium serif')).to.eql({ 'font-size': 'medium', 'font-family': ['serif'] });
      expect(CssValue.parse('large serif')).to.eql({ 'font-size': 'large', 'font-family': ['serif'] });
      expect(CssValue.parse('x-large serif')).to.eql({ 'font-size': 'x-large', 'font-family': ['serif'] });
      expect(CssValue.parse('xx-large serif')).to.eql({ 'font-size': 'xx-large', 'font-family': ['serif'] });

      expect(CssValue.parse('larger serif')).to.eql({ 'font-size': 'larger', 'font-family': ['serif'] });
      expect(CssValue.parse('smaller serif')).to.eql({ 'font-size': 'smaller', 'font-family': ['serif'] });
    });

    it('correctly parses lengths', function () {
      expect(CssValue.parse('1px serif')).to.eql({ 'font-size': '1px', 'font-family': ['serif'] });
      expect(CssValue.parse('1em serif')).to.eql({ 'font-size': '1em', 'font-family': ['serif'] });
      expect(CssValue.parse('1ex serif')).to.eql({ 'font-size': '1ex', 'font-family': ['serif'] });
      expect(CssValue.parse('1ch serif')).to.eql({ 'font-size': '1ch', 'font-family': ['serif'] });
      expect(CssValue.parse('1rem serif')).to.eql({ 'font-size': '1rem', 'font-family': ['serif'] });
      expect(CssValue.parse('1vh serif')).to.eql({ 'font-size': '1vh', 'font-family': ['serif'] });
      expect(CssValue.parse('1vw serif')).to.eql({ 'font-size': '1vw', 'font-family': ['serif'] });
      expect(CssValue.parse('1vmin serif')).to.eql({ 'font-size': '1vmin', 'font-family': ['serif'] });
      expect(CssValue.parse('1vmax serif')).to.eql({ 'font-size': '1vmax', 'font-family': ['serif'] });
      expect(CssValue.parse('1mm serif')).to.eql({ 'font-size': '1mm', 'font-family': ['serif'] });
      expect(CssValue.parse('1cm serif')).to.eql({ 'font-size': '1cm', 'font-family': ['serif'] });
      expect(CssValue.parse('1in serif')).to.eql({ 'font-size': '1in', 'font-family': ['serif'] });
      expect(CssValue.parse('1pt serif')).to.eql({ 'font-size': '1pt', 'font-family': ['serif'] });
      expect(CssValue.parse('1pc serif')).to.eql({ 'font-size': '1pc', 'font-family': ['serif'] });
    });

    it('returns null when it fails to parse a font-size', function () {
      expect(CssValue.parse('1 serif')).to.eql(null);
      expect(CssValue.parse('xxx-small serif')).to.eql(null);
      expect(CssValue.parse('1bs serif')).to.eql(null);
      expect(CssValue.parse('100 % serif')).to.eql(null);
    });

    it('correctly parses percentages', function () {
      expect(CssValue.parse('100% serif')).to.eql({ 'font-size': '100%', 'font-family': ['serif'] });
    });

    it('correctly parses numbers', function () {
      expect(CssValue.parse('1px serif')).to.eql({ 'font-size': '1px', 'font-family': ['serif'] });
      expect(CssValue.parse('1.1px serif')).to.eql({ 'font-size': '1.1px', 'font-family': ['serif'] });
      expect(CssValue.parse('-1px serif')).to.eql({ 'font-size': '-1px', 'font-family': ['serif'] });
      expect(CssValue.parse('-1.1px serif')).to.eql({ 'font-size': '-1.1px', 'font-family': ['serif'] });
      expect(CssValue.parse('+1px serif')).to.eql({ 'font-size': '+1px', 'font-family': ['serif'] });
      expect(CssValue.parse('+1.1px serif')).to.eql({ 'font-size': '+1.1px', 'font-family': ['serif'] });
      expect(CssValue.parse('.1px serif')).to.eql({ 'font-size': '.1px', 'font-family': ['serif'] });
      expect(CssValue.parse('+.1px serif')).to.eql({ 'font-size': '+.1px', 'font-family': ['serif'] });
      expect(CssValue.parse('-.1px serif')).to.eql({ 'font-size': '-.1px', 'font-family': ['serif'] });
    });

    it('returns null when it fails to parse a number', function () {
      expect(CssValue.parse('12.px serif')).to.eql(null);
      expect(CssValue.parse('+---12.2px serif')).to.eql(null);
      expect(CssValue.parse('12.1.1px serif')).to.eql(null);
      expect(CssValue.parse('10e3px serif')).to.eql(null);
    });

    it('correctly parses line-height', function () {
      expect(CssValue.parse('12px/16px serif')).to.eql({ 'font-size': '12px', 'line-height': '16px', 'font-family': ['serif'] });
      expect(CssValue.parse('12px/1.5 serif')).to.eql({ 'font-size': '12px', 'line-height': '1.5', 'font-family': ['serif'] });
      expect(CssValue.parse('12px/normal serif')).to.eql({ 'font-size': '12px', 'font-family': ['serif'] });
      expect(CssValue.parse('12px/105% serif')).to.eql({ 'font-size': '12px', 'line-height': '105%', 'font-family': ['serif'] });
    });

    it('correctly parses font-style', function () {
      expect(CssValue.parse('italic 12px serif')).to.eql({ 'font-size': '12px', 'font-style': 'italic', 'font-family': ['serif'] });
      expect(CssValue.parse('oblique 12px serif')).to.eql({ 'font-size': '12px', 'font-style': 'oblique', 'font-family': ['serif'] });
    });

    it('correctly parses font-variant', function () {
      expect(CssValue.parse('small-caps 12px serif')).to.eql({ 'font-size': '12px', 'font-variant': 'small-caps', 'font-family': ['serif'] });
    });

    it('correctly parses font-weight', function () {
      expect(CssValue.parse('bold 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': 'bold', 'font-family': ['serif'] });
      expect(CssValue.parse('bolder 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': 'bolder', 'font-family': ['serif'] });
      expect(CssValue.parse('lighter 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': 'lighter', 'font-family': ['serif'] });

      for (var i = 1; i < 10; i += 1) {
        expect(CssValue.parse(i * 100 + ' 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': i * 100, 'font-family': ['serif'] });
      }
    });

    it('correctly parses font-stretch', function () {
      expect(CssValue.parse('ultra-condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'ultra-condensed', 'font-family': ['serif'] });
      expect(CssValue.parse('extra-condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'extra-condensed', 'font-family': ['serif'] });
      expect(CssValue.parse('condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'condensed', 'font-family': ['serif'] });
      expect(CssValue.parse('semi-condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'semi-condensed', 'font-family': ['serif'] });
      expect(CssValue.parse('semi-expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'semi-expanded', 'font-family': ['serif'] });
      expect(CssValue.parse('expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'expanded', 'font-family': ['serif'] });
      expect(CssValue.parse('extra-expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'extra-expanded', 'font-family': ['serif'] });
      expect(CssValue.parse('ultra-expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'ultra-expanded', 'font-family': ['serif'] });
    });
  });
});
