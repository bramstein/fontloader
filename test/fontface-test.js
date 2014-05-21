describe('FontFace', function () {
  var FontFace = fontloader.FontFace;

  describe('#constructor', function () {
    it('throws when called without arguments', function () {
      expect(function () {
        new FontFace();
      }).to.throwException();
    });

    it('throws when called with less than three arguments', function () {
      expect(function () {
        new FontFace('My Family');
      }).to.throwException();
    });

    // use feature detection so these tests do not fail on
    // older browsers that do not support array buffers.
    if (window['ArrayBuffer']) {
      it('parses source data', function () {
        var buffer = new ArrayBuffer(32);
        expect(new FontFace('My Family', buffer, {}).data).to.eql(buffer);
      });
    }

    it('parses source urls', function () {
      expect(new FontFace('My Family', 'url(font.woff)', {}).urls).to.eql(['font.woff']);
      expect(new FontFace('My Family', 'url("font.woff")', {}).urls).to.eql(['font.woff']);
      expect(new FontFace('My Family', "url('font.woff')", {}).urls).to.eql(['font.woff']);
      expect(new FontFace('My Family', 'url(font.woff),url(font.otf)', {}).urls).to.eql(['font.woff', 'font.otf']);
      expect(new FontFace('My Family', 'url(font.woff), url(font.otf)', {}).urls).to.eql(['font.woff', 'font.otf']);
    });

    it('parses source urls with formats', function () {
      expect(new FontFace('My Family', 'url(font.woff) format(woff)', {}).urls).to.eql(['font.woff']);
      expect(new FontFace('My Family', 'url(font.woff) format(woff), url(font.otf) format(opentype)', {}).urls).to.eql(['font.woff', 'font.otf']);
    });

    it('rejects the promise if source urls are invalid', function (done) {
      var font = new FontFace('My Family', 'font.woff', {});
      font.load().catch(function (e) {
        expect(e).to.be.a(SyntaxError);
        done();
      });
    });

    it('parses descriptors', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { style: 'italic' }).style).to.eql('italic');
      expect(new FontFace('My Family', 'url(font.woff)', { weight: 'bold' }).weight).to.eql('bold');
      expect(new FontFace('My Family', 'url(font.woff)', { stretch: 'condensed' }).stretch).to.eql('condensed');
      expect(new FontFace('My Family', 'url(font.woff)', { unicodeRange: 'u+ff' }).unicodeRange).to.eql('u+ff');
      expect(new FontFace('My Family', 'url(font.woff)', { variant: 'small-caps' }).variant).to.eql('small-caps');
    });

    it('rejects the promise if descriptors are invalid', function (done) {
      var font = new FontFace('My Family', 'font.woff', { style: 'red' });
      font.load().catch(function (e) {
        expect(e).to.be.a(SyntaxError);
        done();
      });
    });

    it('defaults descriptors if not given', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.style).to.eql('normal');
      expect(font.weight).to.eql('normal');
      expect(font.stretch).to.eql('normal');
      expect(font.unicodeRange).to.eql('u+0-10FFFF');
      expect(font.variant).to.eql('normal');
      expect(font.featureSettings).to.eql('normal');
    });
  });

  describe('#validate', function () {
    it('validates descriptors', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.validate(null, /./)).to.eql(null);
      expect(font.validate(undefined, /./)).to.eql(null);
      expect(function () {
        font.validate('hello', /world/);
      }).to.throwException();
      expect(font.validate('hello', /hello/)).to.eql('hello');
    });
  });

  describe('DescriptorValidator', function () {
    var validator = FontFace.DescriptorValidator;

    it('parses style correctly', function () {
      expect(validator.STYLE.test('italic')).to.be(true);
      expect(validator.STYLE.test('oblique')).to.be(true);
      expect(validator.STYLE.test('normal')).to.be(true);
      expect(validator.STYLE.test('Italic')).to.be(false);
      expect(validator.STYLE.test('bold')).to.be(false);
      expect(validator.STYLE.test('italics')).to.be(false);
      expect(validator.STYLE.test('nitalics')).to.be(false);
    });

    it('parses weight correctly', function () {
      expect(validator.WEIGHT.test('bold')).to.be(true);
      expect(validator.WEIGHT.test('bolder')).to.be(true);
      expect(validator.WEIGHT.test('lighter')).to.be(true);
      expect(validator.WEIGHT.test('100')).to.be(true);
      expect(validator.WEIGHT.test('200')).to.be(true);
      expect(validator.WEIGHT.test('300')).to.be(true);
      expect(validator.WEIGHT.test('400')).to.be(true);
      expect(validator.WEIGHT.test('500')).to.be(true);
      expect(validator.WEIGHT.test('600')).to.be(true);
      expect(validator.WEIGHT.test('700')).to.be(true);
      expect(validator.WEIGHT.test('800')).to.be(true);
      expect(validator.WEIGHT.test('900')).to.be(true);
      expect(validator.WEIGHT.test('1000')).to.be(false);
      expect(validator.WEIGHT.test('light')).to.be(false);
      expect(validator.WEIGHT.test('nbolds')).to.be(false);
    });

    it('parses stretch correctly', function () {
      expect(validator.STRETCH.test('ultra-condensed')).to.be(true);
      expect(validator.STRETCH.test('extra-condensed')).to.be(true);
      expect(validator.STRETCH.test('semi-condensed')).to.be(true);
      expect(validator.STRETCH.test('ultra-expanded')).to.be(true);
      expect(validator.STRETCH.test('extra-expanded')).to.be(true);
      expect(validator.STRETCH.test('semi-expanded')).to.be(true);
      expect(validator.STRETCH.test('condensed')).to.be(true);
      expect(validator.STRETCH.test('expanded')).to.be(true);
      expect(validator.STRETCH.test('normal')).to.be(true);
      expect(validator.STRETCH.test('bold')).to.be(false);
      expect(validator.STRETCH.test('')).to.be(false);
    });

    it('parses unicodeRange correctly', function () {
      expect(validator.UNICODE_RANGE.test('u+ff')).to.be(true);
      expect(validator.UNICODE_RANGE.test('U+Ff')).to.be(true);
      expect(validator.UNICODE_RANGE.test('U+F?')).to.be(true);
      expect(validator.UNICODE_RANGE.test('U+AA-FF')).to.be(true);
      expect(validator.UNICODE_RANGE.test('U+FF-')).to.be(false);
      expect(validator.UNICODE_RANGE.test('U+FFFFFFFFF')).to.be(false);
    });

    it('parses variant correctly', function () {
      expect(validator.VARIANT.test('small-caps')).to.be(true);
      expect(validator.VARIANT.test('normal')).to.be(true);
    });
  });
});
