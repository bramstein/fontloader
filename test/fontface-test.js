describe('FontFace', function () {
  var FontFace = fontloader.FontFace,
      FontFaceObserver = fontloader.FontFaceObserver,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus;

  describe('#constructor', function () {
    it('throws when called without arguments', function () {
      expect(function () {
        new FontFace();
      }, 'to throw exception');
    });

    it('throws when called with less than three arguments', function () {
      expect(function () {
        new FontFace('My Family');
      }, 'to throw exception');
    });

    // use feature detection so these tests do not fail on
    // older browsers that do not support array buffers.
    if (window['ArrayBuffer']) {
      it('parses source data', function () {
        expect(new FontFace('My Family', new ArrayBuffer(4), {}).src, 'to equal', 'url(data:font/opentype;base64,AAAAAA==)');
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
      expect(new FontFace('My Family', 'url(font.woff)', {}).src, 'to equal', 'url(font.woff)');
      expect(new FontFace('My Family', 'url("font.woff")', {}).src, 'to equal', 'url(font.woff)');
      expect(new FontFace('My Family', "url('font.woff')", {}).src, 'to equal', "url(font.woff)");
      expect(new FontFace('My Family', 'url(font.woff),url(font.otf)', {}).src, 'to equal', 'url(font.woff),url(font.otf)');
      expect(new FontFace('My Family', 'url(font.woff), url(font.otf)', {}).src, 'to equal', 'url(font.woff),url(font.otf)');
    });

    it('parses source urls with formats', function () {
      expect(new FontFace('My Family', 'url(font.woff) format(woff)', {}).src, 'to equal', 'url(font.woff) format(\'woff\')');
      expect(new FontFace('My Family', 'url(font.woff) format(woff), url(font.otf) format(opentype)', {}).src, 'to equal', 'url(font.woff) format(\'woff\'),url(font.otf) format(\'opentype\')');
    });

    it('rejects the promise if source urls are invalid', function (done) {
      var font = new FontFace('My Family', 'font.woff', {});
      font.load().catch(function (e) {
        expect(e, 'to be a', SyntaxError);
        done();
      });
    });

    it('rejects the promise if the source url is not a string or arraybuffer', function (done) {
      var font = new FontFace('My Family', true, {});
      font.load().catch(function (e) {
        expect(e, 'to be a', SyntaxError);
        done();
      });
    });

    it('parses descriptors', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { style: 'italic' }).style, 'to equal', 'italic');
      expect(new FontFace('My Family', 'url(font.woff)', { weight: 'bold' }).weight, 'to equal', 'bold');
      expect(new FontFace('My Family', 'url(font.woff)', { stretch: 'condensed' }).stretch, 'to equal', 'condensed');
      expect(new FontFace('My Family', 'url(font.woff)', { unicodeRange: 'u+ff' }).unicodeRange, 'to equal', 'u+ff');
      expect(new FontFace('My Family', 'url(font.woff)', { variant: 'small-caps' }).variant, 'to equal', 'small-caps');
    });

    it('rejects the promise if the descriptors are not strings', function (done) {
      var font = new FontFace('My Family', 'url(font.woff)', { style: true });

      font.load().catch(function (e) {
        expect(e, 'to be a', SyntaxError);
        done();
      });
    });

    it('rejects the promise if descriptors are invalid', function (done) {
      var font = new FontFace('My Family', 'font.woff', { style: 'red' });
      font.load().catch(function (e) {
        expect(e, 'to be a', SyntaxError);
        done();
      });
    });

    it('defaults descriptors if not given', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.style, 'to equal', 'normal');
      expect(font.weight, 'to equal', 'normal');
      expect(font.stretch, 'to equal', 'normal');
      expect(font.unicodeRange, 'to equal', 'u+0-10ffff');
      expect(font.variant, 'to equal', 'normal');
      expect(font.featureSettings, 'to equal', 'normal');
    });
  });

  describe('#parse', function () {
    it('parses descriptors', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(function () {
        font.validate('hello', function () { return null; });
      }, 'to throw exception');
      expect(font.parse('hello', function () { return 'hello'; }), 'to equal', 'hello');
    });
  });

  describe('#load', function () {
    var startMethod = null;

    beforeEach(function () {
      startMethod = FontFaceObserver.prototype.start;
    });

    afterEach(function () {
      FontFaceObserver.prototype.start = startMethod;
    });

    it('returns immediately if the font is already loaded', function () {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});
      font.status = FontFaceLoadStatus.LOADED;

      expect(font.load(), 'to equal', font.promise);
    });

    it('resolves when the font loads', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return Promise.resolve(font);
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        done();
      });
    });

    it('resolves when the font loads with a delay', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(font);
          }, 50);
        });
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        done();
      });
    });

    it('rejects when the font fails to load', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return Promise.reject(font);
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().catch(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.ERROR);
        done();
      });
    });

    it('rejects when the font fails to load with a delay', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(font);
          }, 50);
        });
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().catch(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.ERROR);
        done();
      });
    });

    if (window['ArrayBuffer']) {
      it('loads immediately when given an arraybuffer', function (done) {
        FontFaceObserver.prototype.start = function () {
          return Promise.resolve('font');
        };

        var font = new FontFace('My Family', new ArrayBuffer(4), {});

        expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

        font.load().then(function (f) {
          expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
          expect(f, 'to equal', 'font');
          done();
        }, function (r) {
          done(r);
        });
      });
    }
  });

  describe('#toCss', function () {
    it('generates valid CSS', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});
      expect(font.toCss(), 'to equal', '@font-face{font-family:My Family;font-style:normal;font-weight:normal;font-stretch:normal;font-variant:normal;font-feature-settings:normal;-moz-font-feature-settings:normal;-webkit-font-feature-settings:normal;unicode-range:u+0-10ffff;src:url(font.woff)}');
    });
  });

  describe('#equals', function () {
    it('equals the same font', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.equals(font), 'to be true');
    });

    it('does not equal a different font', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {}),
          other = new FontFace('My Other Family', 'url(font.woff)', {});

      expect(font.equals(other), 'to be false');
    });

    it('equals the same font with the same descriptors', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {
            weight: 'bold'
          }),
          other = new FontFace('My Family', 'url(font.woff)', {
            weight: 'bold'
          });

      expect(font.equals(other), 'to be true');
    });

    it('equals the same font even if the font data is different', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {}),
          other = new FontFace('My Family', 'url(other.woff)', {});

      expect(font.equals(other), 'to be true');
    });
  });
});
