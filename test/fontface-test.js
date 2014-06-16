describe('FontFace', function () {
  var FontFace = fontloader.FontFace,
      FontFaceLoader = fontloader.FontFaceLoader,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus;

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
    //it('parses parameters asynchronously', function (done) {
    //  var font = new FontFace('My Family', 'url(font.woff)', {});
    //  expect(font.family).to.eql(null);
    //  setTimeout(function () {
    //    expect(font.family).to.eql('My Family');
    //    done();
    //  }, 0);
    //});

    it('parses source urls', function () {
      expect(new FontFace('My Family', 'url(font.woff)', {}).src).to.eql('url(font.woff)');
      expect(new FontFace('My Family', 'url("font.woff")', {}).src).to.eql('url(font.woff)');
      expect(new FontFace('My Family', "url('font.woff')", {}).src).to.eql("url(font.woff)");
      expect(new FontFace('My Family', 'url(font.woff),url(font.otf)', {}).src).to.eql('url(font.woff),url(font.otf)');
      expect(new FontFace('My Family', 'url(font.woff), url(font.otf)', {}).src).to.eql('url(font.woff),url(font.otf)');
    });

    it('parses source urls with formats', function () {
      expect(new FontFace('My Family', 'url(font.woff) format(woff)', {}).src).to.eql('url(font.woff) format(woff)');
      expect(new FontFace('My Family', 'url(font.woff) format(woff), url(font.otf) format(opentype)', {}).src).to.eql('url(font.woff) format(woff),url(font.otf) format(opentype)');
    });

    it('rejects the promise if source urls are invalid', function (done) {
      var font = new FontFace('My Family', 'font.woff', {});
      font.load().catch(function (e) {
        expect(e).to.be.a(SyntaxError);
        done();
      });
    });

    it('rejects the promise if the source url is not a string or arraybuffer', function (done) {
      var font = new FontFace('My Family', true, {});
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

  describe('#load', function () {
    var loadMethod = null;

    beforeEach(function () {
      loadMethod = FontFaceLoader.prototype.load;
    });

    afterEach(function () {
      FontFaceLoader.prototype.load = loadMethod;
    });

    it('returns immediately if the font is already loaded', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});
      font.status = FontFaceLoadStatus.LOADED;

      expect(font.load()).to.eql(font.promise);
    });

    it('resolves when the font loads', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      FontFaceLoader.prototype.load = function () {
        return Promise.resolve(font);
      };

      expect(font.status).to.eql(FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font).to.eql(f);
        expect(font.status).to.eql(FontFaceLoadStatus.LOADED);
        done();
      });
    });

    it('resolves when the font loads with a delay', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      FontFaceLoader.prototype.load = function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(font);
          }, 50);
        });
      };

      expect(font.status).to.eql(FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font).to.eql(f);
        expect(font.status).to.eql(FontFaceLoadStatus.LOADED);
        done();
      });
    });

    it('rejects when the font fails to load', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      FontFaceLoader.prototype.load = function () {
        return Promise.reject(font);
      };

      expect(font.status).to.eql(FontFaceLoadStatus.UNLOADED);

      font.load().catch(function (f) {
        expect(font).to.eql(f);
        expect(font.status).to.eql(FontFaceLoadStatus.ERROR);
        done();
      });
    });

    it('rejects when the font fails to load with a delay', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      FontFaceLoader.prototype.load = function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(font);
          }, 50);
        });
      };

      expect(font.status).to.eql(FontFaceLoadStatus.UNLOADED);

      font.load().catch(function (f) {
        expect(font).to.eql(f);
        expect(font.status).to.eql(FontFaceLoadStatus.ERROR);
        done();
      });
    });

    it('loads immediately when given an arraybuffer', function (done) {
      FontFaceLoader.prototype.load = function () {
        return Promise.resolve('font');
      };

      var font = new FontFace('My Family', new ArrayBuffer(4), {});

      expect(font.status).to.eql(FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font.status).to.eql(FontFaceLoadStatus.LOADED);
        expect(f).to.eql('font');
        done();
      }, function (r) {
        done(r);
      });
    });
  });

  describe('#toCss', function () {
    it('generates valid CSS', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});
      expect(font.toCss()).to.eql('@font-face{font-family:My Family;font-style:normal;font-weight:normal;font-stretch:normal;font-variant:normal;font-feature-settings:normal;-moz-font-feature-settings:normal;-webkit-font-feature-settings:normal;unicode-range:u+0-10ffff;src:url(font.woff)}');
    });
  });

  describe('#equals', function () {
    it('equals the same font', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.equals(font)).to.be(true);
    });

    it('does not equal a different font', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {}),
          other = new FontFace('My Other Family', 'url(font.woff)', {});

      expect(font.equals(other)).to.be(false);
    });

    it('equals the same font with the same descriptors', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {
            weight: 'bold'
          }),
          other = new FontFace('My Family', 'url(font.woff)', {
            weight: 'bold'
          });

      expect(font.equals(other)).to.be(true);
    });

    it('equals the same font even if the font data is different', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {}),
          other = new FontFace('My Family', 'url(other.woff)', {});

      expect(font.equals(other)).to.be(true);
    });
  });
});
