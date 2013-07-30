describe('fontloader.CSSValue', function () {
  var CSSValue = fontloader.CSSValue;

  describe('serialize', function () {
    it('serializes an empty value', function () {
      expect(CSSValue.serialize({})).to.eql('');
    });

    it('serializes a single property', function () {
      expect(CSSValue.serialize({
        'font-size': '12px'
      })).to.eql('font-size:12px');
    });

    it('serializes multiple properties', function () {
      expect(CSSValue.serialize({
        'font-size': '12px',
        'line-height': '16px'
      })).to.eql('font-size:12px;line-height:16px');
    });

    it('serializes a property with multiple values', function () {
      expect(CSSValue.serialize({
        'font-family': ['Arial', 'Verdana', 'sans-serif']
      })).to.eql('font-family:Arial,Verdana,sans-serif');
    });
  });

  describe('parse', function () {
    it('returns null on invalid css font values', function () {
      expect(CSSValue.parse('')).to.eql(null);
      expect(CSSValue.parse('Arial')).to.eql(null);
      expect(CSSValue.parse('12px')).to.eql(null);
      expect(CSSValue.parse('12px/16px')).to.eql(null);
      expect(CSSValue.parse('bold 12px/16px')).to.eql(null);
    });

    it('ignores non-terminated strings', function () {
      expect(CSSValue.parse('12px "Comic')).to.eql(null);
      expect(CSSValue.parse('12px "Comic, serif')).to.eql(null);
      expect(CSSValue.parse("12px 'Comic")).to.eql(null);
      expect(CSSValue.parse("12px 'Comic, serif")).to.eql(null);
    });

    it('parses a simple font specification correctly', function () {
      expect(CSSValue.parse('12px serif')).to.eql({ 'font-size': '12px', 'font-family': ['serif'] });
    });

    it('returns multiple font families', function () {
      expect(CSSValue.parse('12px Arial, Verdana, serif')).to.eql({ 'font-size': '12px', 'font-family': ['Arial', 'Verdana', 'serif'] });
    });

    it('handles quoted family names correctly', function () {
      expect(CSSValue.parse('12px "Times New Roman"')).to.eql({ 'font-size': '12px', 'font-family': ['"Times New Roman"'] });
      expect(CSSValue.parse("12px 'Times New Roman'")).to.eql({ 'font-size': '12px', 'font-family': ["'Times New Roman'"] });

      expect(CSSValue.parse('12px "Times\\\' New Roman"')).to.eql({ 'font-size': '12px', 'font-family': ["\"Times\\\' New Roman\""] });
      expect(CSSValue.parse("12px 'Times\\\" New Roman'")).to.eql({ 'font-size': '12px', 'font-family': ['\'Times\\\" New Roman\''] });

      expect(CSSValue.parse('12px "Times\\\" New Roman"')).to.eql({ 'font-size': '12px', 'font-family': ['"Times\\\" New Roman"'] });
      expect(CSSValue.parse("12px 'Times\\\' New Roman'")).to.eql({ 'font-size': '12px', 'font-family': ["'Times\\\' New Roman'"] });
    });

    it('handles unquoted identifiers correctly', function () {
      expect(CSSValue.parse('12px Times New Roman')).to.eql({ 'font-size': '12px', 'font-family': ['Times New Roman'] });
      expect(CSSValue.parse('12px Times New Roman, Comic Sans MS')).to.eql({ 'font-size': '12px', 'font-family': ['Times New Roman', 'Comic Sans MS'] });
    });

    // Examples taken from: http://mathiasbynens.be/notes/unquoted-font-family
    it('correctly returns null on invalid identifiers', function () {
      expect(CSSValue.parse('12px Red/Black')).to.eql(null);
      expect(CSSValue.parse("12px 'Lucida' Grande")).to.eql(null);
      expect(CSSValue.parse('12px Ahem!')).to.eql(null);
      expect(CSSValue.parse('12px Hawaii 5-0')).to.eql(null);
      expect(CSSValue.parse('12px $42')).to.eql(null);
    });

    it('correctly parses escaped characters in identifiers', function () {
      expect(CSSValue.parse('12px Red\\/Black')).to.eql({ 'font-size': '12px', 'font-family': ['Red\\/Black'] });
      expect(CSSValue.parse('12px Lucida    Grande')).to.eql({ 'font-size': '12px', 'font-family': ['Lucida Grande'] });
      expect(CSSValue.parse('12px Ahem\\!')).to.eql({ 'font-size': '12px', 'font-family': ['Ahem\\!'] });
      expect(CSSValue.parse('12px \\$42')).to.eql({ 'font-size': '12px', 'font-family': ['\\$42'] });
      expect(CSSValue.parse('12px €42')).to.eql({ 'font-size': '12px', 'font-family': ['€42'] });
    });

    it('correctly parses font-size', function () {
      expect(CSSValue.parse('12px serif')).to.eql({ 'font-size': '12px', 'font-family': ['serif'] });
      expect(CSSValue.parse('xx-small serif')).to.eql({ 'font-size': 'xx-small', 'font-family': ['serif'] });
      expect(CSSValue.parse('s-small serif')).to.eql({ 'font-size': 's-small', 'font-family': ['serif'] });
      expect(CSSValue.parse('small serif')).to.eql({ 'font-size': 'small', 'font-family': ['serif'] });
      expect(CSSValue.parse('medium serif')).to.eql({ 'font-size': 'medium', 'font-family': ['serif'] });
      expect(CSSValue.parse('large serif')).to.eql({ 'font-size': 'large', 'font-family': ['serif'] });
      expect(CSSValue.parse('x-large serif')).to.eql({ 'font-size': 'x-large', 'font-family': ['serif'] });
      expect(CSSValue.parse('xx-large serif')).to.eql({ 'font-size': 'xx-large', 'font-family': ['serif'] });

      expect(CSSValue.parse('larger serif')).to.eql({ 'font-size': 'larger', 'font-family': ['serif'] });
      expect(CSSValue.parse('smaller serif')).to.eql({ 'font-size': 'smaller', 'font-family': ['serif'] });
    });

    it('correctly parses lengths', function () {
      expect(CSSValue.parse('1px serif')).to.eql({ 'font-size': '1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('1em serif')).to.eql({ 'font-size': '1em', 'font-family': ['serif'] });
      expect(CSSValue.parse('1ex serif')).to.eql({ 'font-size': '1ex', 'font-family': ['serif'] });
      expect(CSSValue.parse('1ch serif')).to.eql({ 'font-size': '1ch', 'font-family': ['serif'] });
      expect(CSSValue.parse('1rem serif')).to.eql({ 'font-size': '1rem', 'font-family': ['serif'] });
      expect(CSSValue.parse('1vh serif')).to.eql({ 'font-size': '1vh', 'font-family': ['serif'] });
      expect(CSSValue.parse('1vw serif')).to.eql({ 'font-size': '1vw', 'font-family': ['serif'] });
      expect(CSSValue.parse('1vmin serif')).to.eql({ 'font-size': '1vmin', 'font-family': ['serif'] });
      expect(CSSValue.parse('1vmax serif')).to.eql({ 'font-size': '1vmax', 'font-family': ['serif'] });
      expect(CSSValue.parse('1mm serif')).to.eql({ 'font-size': '1mm', 'font-family': ['serif'] });
      expect(CSSValue.parse('1cm serif')).to.eql({ 'font-size': '1cm', 'font-family': ['serif'] });
      expect(CSSValue.parse('1in serif')).to.eql({ 'font-size': '1in', 'font-family': ['serif'] });
      expect(CSSValue.parse('1pt serif')).to.eql({ 'font-size': '1pt', 'font-family': ['serif'] });
      expect(CSSValue.parse('1pc serif')).to.eql({ 'font-size': '1pc', 'font-family': ['serif'] });
    });

    it('returns null when it fails to parse a font-size', function () {
      expect(CSSValue.parse('1 serif')).to.eql(null);
      expect(CSSValue.parse('xxx-small serif')).to.eql(null);
      expect(CSSValue.parse('1bs serif')).to.eql(null);
      expect(CSSValue.parse('100 % serif')).to.eql(null);
    });

    it('correctly parses percentages', function () {
      expect(CSSValue.parse('100% serif')).to.eql({ 'font-size': '100%', 'font-family': ['serif'] });
    });

    it('correctly parses numbers', function () {
      expect(CSSValue.parse('1px serif')).to.eql({ 'font-size': '1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('1.1px serif')).to.eql({ 'font-size': '1.1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('-1px serif')).to.eql({ 'font-size': '-1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('-1.1px serif')).to.eql({ 'font-size': '-1.1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('+1px serif')).to.eql({ 'font-size': '+1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('+1.1px serif')).to.eql({ 'font-size': '+1.1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('.1px serif')).to.eql({ 'font-size': '.1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('+.1px serif')).to.eql({ 'font-size': '+.1px', 'font-family': ['serif'] });
      expect(CSSValue.parse('-.1px serif')).to.eql({ 'font-size': '-.1px', 'font-family': ['serif'] });
    });

    it('returns null when it fails to parse a number', function () {
      expect(CSSValue.parse('12.px serif')).to.eql(null);
      expect(CSSValue.parse('+---12.2px serif')).to.eql(null);
      expect(CSSValue.parse('12.1.1px serif')).to.eql(null);
      expect(CSSValue.parse('10e3px serif')).to.eql(null);
    });

    it('correctly parses line-height', function () {
      expect(CSSValue.parse('12px/16px serif')).to.eql({ 'font-size': '12px', 'line-height': '16px', 'font-family': ['serif'] });
      expect(CSSValue.parse('12px/1.5 serif')).to.eql({ 'font-size': '12px', 'line-height': '1.5', 'font-family': ['serif'] });
      expect(CSSValue.parse('12px/normal serif')).to.eql({ 'font-size': '12px', 'font-family': ['serif'] });
      expect(CSSValue.parse('12px/105% serif')).to.eql({ 'font-size': '12px', 'line-height': '105%', 'font-family': ['serif'] });
    });

    it('correctly parses font-style', function () {
      expect(CSSValue.parse('italic 12px serif')).to.eql({ 'font-size': '12px', 'font-style': 'italic', 'font-family': ['serif'] });
      expect(CSSValue.parse('oblique 12px serif')).to.eql({ 'font-size': '12px', 'font-style': 'oblique', 'font-family': ['serif'] });
    });

    it('correctly parses font-variant', function () {
      expect(CSSValue.parse('small-caps 12px serif')).to.eql({ 'font-size': '12px', 'font-variant': 'small-caps', 'font-family': ['serif'] });
    });

    it('correctly parses font-weight', function () {
      expect(CSSValue.parse('bold 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': 'bold', 'font-family': ['serif'] });
      expect(CSSValue.parse('bolder 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': 'bolder', 'font-family': ['serif'] });
      expect(CSSValue.parse('lighter 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': 'lighter', 'font-family': ['serif'] });

      for (var i = 1; i < 10; i += 1) {
        expect(CSSValue.parse(i * 100 + ' 12px serif')).to.eql({ 'font-size': '12px', 'font-weight': i * 100, 'font-family': ['serif'] });
      }
    });

    it('correctly parses font-stretch', function () {
      expect(CSSValue.parse('ultra-condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'ultra-condensed', 'font-family': ['serif'] });
      expect(CSSValue.parse('extra-condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'extra-condensed', 'font-family': ['serif'] });
      expect(CSSValue.parse('condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'condensed', 'font-family': ['serif'] });
      expect(CSSValue.parse('semi-condensed 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'semi-condensed', 'font-family': ['serif'] });
      expect(CSSValue.parse('semi-expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'semi-expanded', 'font-family': ['serif'] });
      expect(CSSValue.parse('expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'expanded', 'font-family': ['serif'] });
      expect(CSSValue.parse('extra-expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'extra-expanded', 'font-family': ['serif'] });
      expect(CSSValue.parse('ultra-expanded 12px serif')).to.eql({ 'font-size': '12px', 'font-stretch': 'ultra-expanded', 'font-family': ['serif'] });
    });
  });
});
