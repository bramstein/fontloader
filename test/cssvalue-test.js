describe('CSSValue', function () {
  var CSSValue = fontloader.CSSValue;

  describe('parseFont', function () {
    it('returns null on invalid css font values', function () {
      expect(function () {
        CSSValue.parseFont('');
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont('Arial');
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont('12px');
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont('12px/16px');
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont('bold 12px/16px');
      }, 'to throw exception');
    });

    it('parses a simple font specification correctly', function () {
      expect(CSSValue.parseFont('12px serif'), 'to have properties', { family: ['serif'] });
    });

    it('returns multiple font families', function () {
      expect(CSSValue.parseFont('12px Arial, Verdana, serif'), 'to have properties', { family: ['Arial', 'Verdana', 'serif'] });
    });

    it('correctly parses escaped characters in identifiers', function () {
      expect(CSSValue.parseFont('12px Red\\/Black'), 'to have properties', { family: ['Red/Black'] });
      expect(CSSValue.parseFont('12px Lucida    Grande'), 'to have properties', { family: ['Lucida Grande'] });
      expect(CSSValue.parseFont('12px Ahem\\!'), 'to have properties', { family: ['Ahem!'] });
      expect(CSSValue.parseFont('12px \\$42'), 'to have properties', { family: ['$42'] });
      expect(CSSValue.parseFont('12px €42'), 'to have properties', { family: ['€42'] });
    });

    it('correctly parses font-style', function () {
      expect(CSSValue.parseFont('italic 12px serif'), 'to have properties', { style: 'italic' });
      expect(CSSValue.parseFont('oblique 12px serif'), 'to have properties', { style: 'oblique' });
    });

    it('correctly parses font-variant', function () {
      expect(CSSValue.parseFont('small-caps 12px serif'), 'to have properties', { variant: 'small-caps' });
    });

    it('correctly parses font-weight', function () {
      expect(CSSValue.parseFont('normal 12px serif'), 'to have properties', { weight: 'normal' });
      expect(CSSValue.parseFont('bold 12px serif'), 'to have properties', { weight: 'bold' });
      expect(CSSValue.parseFont('bolder 12px serif'), 'to have properties', { weight: 'bolder' });
      expect(CSSValue.parseFont('lighter 12px serif'), 'to have properties', { weight: 'lighter' });

      for (var i = 1; i < 10; i += 1) {
        expect(CSSValue.parseFont(i * 100 + ' 12px serif'), 'to have properties', { weight: (i * 100).toString() });
      }
    });

    xit('correctly parses font-stretch', function () {
      expect(CSSValue.parseFont('ultra-condensed 12px serif'), 'to have properties', { stretch: 'ultra-condensed' });
      expect(CSSValue.parseFont('extra-condensed 12px serif'), 'to have properties', { stretch: 'extra-condensed' });
      expect(CSSValue.parseFont('condensed 12px serif'), 'to have properties', { stretch: 'condensed' });
      expect(CSSValue.parseFont('semi-condensed 12px serif'), 'to have properties', { stretch: 'semi-condensed' });
      expect(CSSValue.parseFont('semi-expanded 12px serif'), 'to have properties', { stretch: 'semi-expanded' });
      expect(CSSValue.parseFont('expanded 12px serif'), 'to have properties', { stretch: 'expanded' });
      expect(CSSValue.parseFont('extra-expanded 12px serif'), 'to have properties', { stretch: 'extra-expanded' });
      expect(CSSValue.parseFont('ultra-expanded 12px serif'), 'to have properties', { stretch: 'ultra-expanded' });
    });
  });

  describe('#parseFamily', function () {
    it('parses a single family', function () {
      expect(CSSValue.parseFamily('serif'), 'to equal', ['serif']);
    });

    it('parses multiple identifiers', function () {
      expect(CSSValue.parseFamily('Comic Sans'), 'to equal', ['Comic Sans']);
    });

    it('parses multiple families', function () {
      expect(CSSValue.parseFamily('Comic Sans, sans-serif'), 'to equal', ['Comic Sans', 'sans-serif']);
    });

    it('rejects malformed strings', function () {
      expect(function () {
        CSSValue.parseFamily('"Comic');
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont('"Comic, serif');
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont("'Comic");
      }, 'to throw exception');

      expect(function () {
        CSSValue.parseFont("'Comic, serif");
      }, 'to throw exception');
    });

    it('handles quoted family names correctly', function () {
      expect(CSSValue.parseFamily('"Times New Roman"'), 'to equal', ['Times New Roman']);
      expect(CSSValue.parseFamily("'Times New Roman'"), 'to equal', ['Times New Roman']);

      expect(CSSValue.parseFamily('"Times\\\' New Roman"'), 'to equal', ["Times\\\' New Roman"]);
      expect(CSSValue.parseFamily("'Times\\\" New Roman'"), 'to equal', ['Times\\\" New Roman']);

      expect(CSSValue.parseFamily('12px "Times\\\" New Roman"'), 'to equal', ['Times\\\" New Roman']);
      expect(CSSValue.parseFamily("12px 'Times\\\' New Roman'"), 'to equal', ["Times\\\' New Roman"]);
    });

    it('handles unquoted identifiers correctly', function () {
      expect(CSSValue.parseFamily('Times New Roman'), 'to equal', ['Times New Roman']);
      expect(CSSValue.parseFamily('Times New Roman, Comic Sans MS'), 'to equal', ['Times New Roman', 'Comic Sans MS']);
    });
  });
});
