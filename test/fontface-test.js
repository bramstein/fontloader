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
      expect(font.unicodeRange).to.eql('u+0-10ffff');
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

  describe('#toCss', function () {
    it('generates valid CSS', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});
      expect(font.toCss()).to.eql('@font-face{font-family:My Family;font-style:normal;font-weight:normal;font-stretch:normal;unicode-range:u+0-10ffff;font-variant:normal;font-feature-settings:normal;src:url(font.woff)}');
    });
  });

});
