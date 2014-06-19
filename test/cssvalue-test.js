describe('CssValue', function () {
  var CssValue = fontloader.CssValue;

  describe('Parsers', function () {
    var parsers = CssValue.Parsers;

    it('parses family correctly', function () {
      expect(parsers.FAMILY('myfamily'), 'to equal', 'myfamily');
      expect(parsers.FAMILY('my-family'), 'to equal', 'my-family');
      expect(parsers.FAMILY('My Family'), 'to equal', 'My Family');
      expect(parsers.FAMILY('Red/Black'), 'to equal', null);
      expect(parsers.FAMILY('Ahem!'), 'to equal', null);
      expect(parsers.FAMILY('test@foo'), 'to equal', null);
      expect(parsers.FAMILY('#POUND'), 'to equal', null);
      expect(parsers.FAMILY('Hawaii 5-0'), 'to equal', null);
      expect(parsers.FAMILY('$42'), 'to equal', null);
      expect(parsers.FAMILY('Red\\/Black'), 'to equal', 'Red\\/Black');
      expect(parsers.FAMILY('Lucida     Grande'), 'to equal', 'Lucida Grande');
      expect(parsers.FAMILY('Ahem\\!'), 'to equal', 'Ahem\\!');
      expect(parsers.FAMILY('\\$42'), 'to equal', '\\$42');
      expect(parsers.FAMILY('€42'), 'to equal', '€42');
    });

    it('parses style correctly', function () {
      expect(parsers.STYLE('italic'), 'to equal', 'italic');
      expect(parsers.STYLE('oblique'), 'to equal', 'oblique');
      expect(parsers.STYLE('normal'), 'to equal', 'normal');
      expect(parsers.STYLE('Italic'), 'to equal', null);
      expect(parsers.STYLE('bold'), 'to equal', null);
      expect(parsers.STYLE('italics'), 'to equal', null);
      expect(parsers.STYLE('nitalics'), 'to equal', null);
    });

    it('parses weight correctly', function () {
      expect(parsers.WEIGHT('bold'), 'to equal', 'bold');
      expect(parsers.WEIGHT('bolder'), 'to equal', 'bolder');
      expect(parsers.WEIGHT('lighter'), 'to equal', 'lighter');
      expect(parsers.WEIGHT('100'), 'to equal', '100');
      expect(parsers.WEIGHT('200'), 'to equal', '200');
      expect(parsers.WEIGHT('300'), 'to equal', '300');
      expect(parsers.WEIGHT('400'), 'to equal', '400');
      expect(parsers.WEIGHT('500'), 'to equal', '500');
      expect(parsers.WEIGHT('600'), 'to equal', '600');
      expect(parsers.WEIGHT('700'), 'to equal', '700');
      expect(parsers.WEIGHT('800'), 'to equal', '800');
      expect(parsers.WEIGHT('900'), 'to equal', '900');
      expect(parsers.WEIGHT('1000'), 'to equal', null);
      expect(parsers.WEIGHT('light'), 'to equal', null);
      expect(parsers.WEIGHT('nbolds'), 'to equal', null);
    });

    it('parses stretch correctly', function () {
      expect(parsers.STRETCH('ultra-condensed'), 'to equal', 'ultra-condensed');
      expect(parsers.STRETCH('extra-condensed'), 'to equal', 'extra-condensed');
      expect(parsers.STRETCH('semi-condensed'), 'to equal', 'semi-condensed');
      expect(parsers.STRETCH('ultra-expanded'), 'to equal', 'ultra-expanded');
      expect(parsers.STRETCH('extra-expanded'), 'to equal', 'extra-expanded');
      expect(parsers.STRETCH('semi-expanded'), 'to equal', 'semi-expanded');
      expect(parsers.STRETCH('condensed'), 'to equal', 'condensed');
      expect(parsers.STRETCH('expanded'), 'to equal', 'expanded');
      expect(parsers.STRETCH('normal'), 'to equal', 'normal');
      expect(parsers.STRETCH('bold'), 'to equal', null);
      expect(parsers.STRETCH(''), 'to equal', null);
    });

    it('parses unicodeRange correctly', function () {
      expect(parsers.UNICODE_RANGE('u+ff').toString(), 'to equal', 'u+ff');
      expect(parsers.UNICODE_RANGE('U+Ff').toString(), 'to equal', 'u+ff');
      expect(parsers.UNICODE_RANGE('U+F?').toString(), 'to equal', 'u+f0-ff');
      expect(parsers.UNICODE_RANGE('U+AA-FF').toString(), 'to equal', 'u+aa-ff');
      expect(function () {
        parsers.UNICODE_RANGE('U+FF-');
      }, 'to throw exception');
      expect(function () {
        parsers.UNICODE_RANGE('U+FFFFFFFFF')
      }, 'to throw exception');
      expect(parsers.UNICODE_RANGE('u+AA,u+AB').toString(), 'to equal', 'u+aa,u+ab');
    });

    it('parses variant correctly', function () {
      expect(parsers.VARIANT('small-caps'), 'to equal', 'small-caps');
      expect(parsers.VARIANT('normal'), 'to equal', 'normal');
    });
  });

  describe('serialize', function () {
    it('serializes an empty value', function () {
      expect(CssValue.serialize({}), 'to equal', '');
    });

    it('serializes a single property', function () {
      expect(CssValue.serialize({
        'font-size': '12px'
      }), 'to equal', 'font-size:12px');
    });

    it('serializes multiple properties', function () {
      expect(CssValue.serialize({
        'font-size': '12px',
        'line-height': '16px'
      }), 'to equal', 'font-size:12px;line-height:16px');
    });

    it('serializes a property with multiple values', function () {
      expect(CssValue.serialize({
        'font-family': ['Arial', 'Verdana', 'sans-serif']
      }), 'to equal', 'font-family:Arial,Verdana,sans-serif');
    });
  });

  describe('parse', function () {
    it('returns null on invalid css font values', function () {
      expect(CssValue.parse(''), 'to equal', null);
      expect(CssValue.parse('Arial'), 'to equal', null);
      expect(CssValue.parse('12px'), 'to equal', null);
      expect(CssValue.parse('12px/16px'), 'to equal', null);
      expect(CssValue.parse('bold 12px/16px'), 'to equal', null);
    });

    it('ignores non-terminated strings', function () {
      expect(CssValue.parse('12px "Comic'), 'to equal', null);
      expect(CssValue.parse('12px "Comic, serif'), 'to equal', null);
      expect(CssValue.parse("12px 'Comic"), 'to equal', null);
      expect(CssValue.parse("12px 'Comic, serif"), 'to equal', null);
    });

    it('parses a simple font specification correctly', function () {
      expect(CssValue.parse('12px serif'), 'to have properties', { size: '12px', family: ['serif'] });
    });

    it('returns multiple font families', function () {
      expect(CssValue.parse('12px Arial, Verdana, serif'), 'to have properties', { size: '12px', family: ['Arial', 'Verdana', 'serif'] });
    });

    it('handles quoted family names correctly', function () {
      expect(CssValue.parse('12px "Times New Roman"'), 'to have properties', { size: '12px', family: ['Times New Roman'] });
      expect(CssValue.parse("12px 'Times New Roman'"), 'to have properties', { size: '12px', family: ["Times New Roman"] });

      expect(CssValue.parse('12px "Times\\\' New Roman"'), 'to have properties', { size: '12px', family: ["Times\\\' New Roman"] });
      expect(CssValue.parse("12px 'Times\\\" New Roman'"), 'to have properties', { size: '12px', family: ['Times\\\" New Roman'] });

      expect(CssValue.parse('12px "Times\\\" New Roman"'), 'to have properties', { size: '12px', family: ['Times\\\" New Roman'] });
      expect(CssValue.parse("12px 'Times\\\' New Roman'"), 'to have properties', { size: '12px', family: ["Times\\\' New Roman"] });
    });

    it('handles unquoted identifiers correctly', function () {
      expect(CssValue.parse('12px Times New Roman'), 'to have properties', { size: '12px', family: ['Times New Roman'] });
      expect(CssValue.parse('12px Times New Roman, Comic Sans MS'), 'to have properties', { size: '12px', family: ['Times New Roman', 'Comic Sans MS'] });
    });

    // Examples taken from: http://mathiasbynens.be/notes/unquoted-font-family
    it('correctly returns null on invalid identifiers', function () {
      expect(CssValue.parse('12px Red/Black'), 'to equal', null);
      expect(CssValue.parse("12px 'Lucida' Grande"), 'to equal', null);
      expect(CssValue.parse('12px Ahem!'), 'to equal', null);
      expect(CssValue.parse('12px Hawaii 5-0'), 'to equal', null);
      expect(CssValue.parse('12px $42'), 'to equal', null);
    });

    it('correctly parses escaped characters in identifiers', function () {
      expect(CssValue.parse('12px Red\\/Black'), 'to have properties', { size: '12px', family: ['Red\\/Black'] });
      expect(CssValue.parse('12px Lucida    Grande'), 'to have properties', { size: '12px', family: ['Lucida Grande'] });
      expect(CssValue.parse('12px Ahem\\!'), 'to have properties', { size: '12px', family: ['Ahem\\!'] });
      expect(CssValue.parse('12px \\$42'), 'to have properties', { size: '12px', family: ['\\$42'] });
      expect(CssValue.parse('12px €42'), 'to have properties', { size: '12px', family: ['€42'] });
    });

    it('correctly parses font-size', function () {
      expect(CssValue.parse('12px serif'), 'to have properties', { size: '12px', family: ['serif'] });
      expect(CssValue.parse('xx-small serif'), 'to have properties', { size: 'xx-small', family: ['serif'] });
      expect(CssValue.parse('s-small serif'), 'to have properties', { size: 's-small', family: ['serif'] });
      expect(CssValue.parse('small serif'), 'to have properties', { size: 'small', family: ['serif'] });
      expect(CssValue.parse('medium serif'), 'to have properties', { size: 'medium', family: ['serif'] });
      expect(CssValue.parse('large serif'), 'to have properties', { size: 'large', family: ['serif'] });
      expect(CssValue.parse('x-large serif'), 'to have properties', { size: 'x-large', family: ['serif'] });
      expect(CssValue.parse('xx-large serif'), 'to have properties', { size: 'xx-large', family: ['serif'] });

      expect(CssValue.parse('larger serif'), 'to have properties', { size: 'larger', family: ['serif'] });
      expect(CssValue.parse('smaller serif'), 'to have properties', { size: 'smaller', family: ['serif'] });
    });

    it('correctly parses lengths', function () {
      expect(CssValue.parse('1px serif'), 'to have properties', { size: '1px', family: ['serif'] });
      expect(CssValue.parse('1em serif'), 'to have properties', { size: '1em', family: ['serif'] });
      expect(CssValue.parse('1ex serif'), 'to have properties', { size: '1ex', family: ['serif'] });
      expect(CssValue.parse('1ch serif'), 'to have properties', { size: '1ch', family: ['serif'] });
      expect(CssValue.parse('1rem serif'), 'to have properties', { size: '1rem', family: ['serif'] });
      expect(CssValue.parse('1vh serif'), 'to have properties', { size: '1vh', family: ['serif'] });
      expect(CssValue.parse('1vw serif'), 'to have properties', { size: '1vw', family: ['serif'] });
      expect(CssValue.parse('1vmin serif'), 'to have properties', { size: '1vmin', family: ['serif'] });
      expect(CssValue.parse('1vmax serif'), 'to have properties', { size: '1vmax', family: ['serif'] });
      expect(CssValue.parse('1mm serif'), 'to have properties', { size: '1mm', family: ['serif'] });
      expect(CssValue.parse('1cm serif'), 'to have properties', { size: '1cm', family: ['serif'] });
      expect(CssValue.parse('1in serif'), 'to have properties', { size: '1in', family: ['serif'] });
      expect(CssValue.parse('1pt serif'), 'to have properties', { size: '1pt', family: ['serif'] });
      expect(CssValue.parse('1pc serif'), 'to have properties', { size: '1pc', family: ['serif'] });
    });

    it('returns null when it fails to parse a font-size', function () {
      expect(CssValue.parse('1 serif'), 'to equal', null);
      expect(CssValue.parse('xxx-small serif'), 'to equal', null);
      expect(CssValue.parse('1bs serif'), 'to equal', null);
      expect(CssValue.parse('100 % serif'), 'to equal', null);
    });

    it('correctly parses percentages', function () {
      expect(CssValue.parse('100% serif'), 'to have properties', { size: '100%', family: ['serif'] });
    });

    it('correctly parses numbers', function () {
      expect(CssValue.parse('1px serif'), 'to have properties', { size: '1px', family: ['serif'] });
      expect(CssValue.parse('1.1px serif'), 'to have properties', { size: '1.1px', family: ['serif'] });
      expect(CssValue.parse('-1px serif'), 'to have properties', { size: '-1px', family: ['serif'] });
      expect(CssValue.parse('-1.1px serif'), 'to have properties', { size: '-1.1px', family: ['serif'] });
      expect(CssValue.parse('+1px serif'), 'to have properties', { size: '+1px', family: ['serif'] });
      expect(CssValue.parse('+1.1px serif'), 'to have properties', { size: '+1.1px', family: ['serif'] });
      expect(CssValue.parse('.1px serif'), 'to have properties', { size: '.1px', family: ['serif'] });
      expect(CssValue.parse('+.1px serif'), 'to have properties', { size: '+.1px', family: ['serif'] });
      expect(CssValue.parse('-.1px serif'), 'to have properties', { size: '-.1px', family: ['serif'] });
    });

    it('returns null when it fails to parse a number', function () {
      expect(CssValue.parse('12.px serif'), 'to equal', null);
      expect(CssValue.parse('+---12.2px serif'), 'to equal', null);
      expect(CssValue.parse('12.1.1px serif'), 'to equal', null);
      expect(CssValue.parse('10e3px serif'), 'to equal', null);
    });

    it('correctly parses line-height', function () {
      expect(CssValue.parse('12px/16px serif'), 'to have properties', { size: '12px', lineHeight: '16px', family: ['serif'] });
      expect(CssValue.parse('12px/1.5 serif'), 'to have properties', { size: '12px', lineHeight: '1.5', family: ['serif'] });
      expect(CssValue.parse('12px/normal serif'), 'to have properties', { size: '12px', family: ['serif'] });
      expect(CssValue.parse('12px/105% serif'), 'to have properties', { size: '12px', lineHeight: '105%', family: ['serif'] });
    });

    it('correctly parses font-style', function () {
      expect(CssValue.parse('italic 12px serif'), 'to have properties', { size: '12px', style: 'italic', family: ['serif'] });
      expect(CssValue.parse('oblique 12px serif'), 'to have properties', { size: '12px', style: 'oblique', family: ['serif'] });
    });

    it('correctly parses font-variant', function () {
      expect(CssValue.parse('small-caps 12px serif'), 'to have properties', { size: '12px', variant: 'small-caps', family: ['serif'] });
    });

    it('correctly parses font-weight', function () {
      expect(CssValue.parse('bold 12px serif'), 'to have properties', { size: '12px', weight: 'bold', family: ['serif'] });
      expect(CssValue.parse('bolder 12px serif'), 'to have properties', { size: '12px', weight: 'bolder', family: ['serif'] });
      expect(CssValue.parse('lighter 12px serif'), 'to have properties', { size: '12px', weight: 'lighter', family: ['serif'] });

      for (var i = 1; i < 10; i += 1) {
        expect(CssValue.parse(i * 100 + ' 12px serif'), 'to have properties', { size: '12px', weight: (i * 100).toString(), family: ['serif'] });
      }
    });

    it('correctly parses font-stretch', function () {
      expect(CssValue.parse('ultra-condensed 12px serif'), 'to have properties', { size: '12px', stretch: 'ultra-condensed', family: ['serif'] });
      expect(CssValue.parse('extra-condensed 12px serif'), 'to have properties', { size: '12px', stretch: 'extra-condensed', family: ['serif'] });
      expect(CssValue.parse('condensed 12px serif'), 'to have properties', { size: '12px', stretch: 'condensed', family: ['serif'] });
      expect(CssValue.parse('semi-condensed 12px serif'), 'to have properties', { size: '12px', stretch: 'semi-condensed', family: ['serif'] });
      expect(CssValue.parse('semi-expanded 12px serif'), 'to have properties', { size: '12px', stretch: 'semi-expanded', family: ['serif'] });
      expect(CssValue.parse('expanded 12px serif'), 'to have properties', { size: '12px', stretch: 'expanded', family: ['serif'] });
      expect(CssValue.parse('extra-expanded 12px serif'), 'to have properties', { size: '12px', stretch: 'extra-expanded', family: ['serif'] });
      expect(CssValue.parse('ultra-expanded 12px serif'), 'to have properties', { size: '12px', stretch: 'ultra-expanded', family: ['serif'] });
    });
  });
});
