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
        expect(new FontFace('My Family', new ArrayBuffer(4), {}).src).to.eql('url(data:font/opentype;base64,AAAAAA==)');
      });
    }

    // TODO: I'm still making up my mind about this. The Chrome implementation parses
    // parameters synchronously which makes sense to me, as long as font loading and
    // parsing is done asynchronously.
    xit('parses parameters asynchronously', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', {});
      expect(font.family).to.eql(null);
      setTimeout(function () {
        expect(font.family).to.eql('My Family');
        done();
      }, 0);
    });

    it('parses source urls', function () {
      expect(new FontFace('My Family', 'url(font.woff)', {}).src).to.eql('url(font.woff)');
      expect(new FontFace('My Family', 'url("font.woff")', {}).src).to.eql('url("font.woff")');
      expect(new FontFace('My Family', "url('font.woff')", {}).src).to.eql("url('font.woff')");
      expect(new FontFace('My Family', 'url(font.woff),url(font.otf)', {}).src).to.eql('url(font.woff),url(font.otf)');
      expect(new FontFace('My Family', 'url(font.woff), url(font.otf)', {}).src).to.eql('url(font.woff), url(font.otf)');
    });

    it('parses source urls with formats', function () {
      expect(new FontFace('My Family', 'url(font.woff) format(woff)', {}).src).to.eql('url(font.woff) format(woff)');
      expect(new FontFace('My Family', 'url(font.woff) format(woff), url(font.otf) format(opentype)', {}).src).to.eql('url(font.woff) format(woff), url(font.otf) format(opentype)');
    });

    it('rejects the promise if source urls are invalid', function (done) {
      var font = new FontFace('My Family', 'font.woff', {});
      font.load().catch(function (e) {
        expect(e).to.be.a(SyntaxError);
        done();
      });

      font = new FontFace('My Family', true, {});
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

    it('rejects the promise if the descriptors are not strings', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', { style: true });

      font.load().catch(function (e) {
        expect(e).to.be.a(SyntaxError);
        done();
      });
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

  describe('#parse', function () {
    it('parses descriptors', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(function () {
        font.validate('hello', function () { return null; });
      }).to.throwException();
      expect(font.parse('hello', function () { return 'hello'; })).to.eql('hello');
    });
  });

  describe('#toCSS', function () {
    it('generates valid CSS', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});
      expect(font.toCSS()).to.eql('@font-face{font-family:My Family;font-style:normal;font-weight:normal;font-stretch:normal;unicode-range:u+0-10FFFF;font-variant:normal;font-feature-settings:normal;src:url(font.woff);}');
    });
  });

  describe('DescriptorParsers', function () {
    var parsers = FontFace.DescriptorParsers;

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
      expect(parsers.UNICODE_RANGE('u+ff')).to.eql('u+ff');
      expect(parsers.UNICODE_RANGE('U+Ff')).to.eql('U+Ff');
      expect(parsers.UNICODE_RANGE('U+F?')).to.eql('U+F?');
      expect(parsers.UNICODE_RANGE('U+AA-FF')).to.eql('U+AA-FF');
      expect(parsers.UNICODE_RANGE('U+FF-')).to.eql(null);
      expect(parsers.UNICODE_RANGE('U+FFFFFFFFF')).to.eql(null);
      expect(parsers.UNICODE_RANGE('u+AA,u+AB')).to.eql('u+AA,u+AB');
    });

    it('parses variant correctly', function () {
      expect(parsers.VARIANT('small-caps')).to.eql('small-caps');
      expect(parsers.VARIANT('normal')).to.eql('normal');
    });
  });
});
