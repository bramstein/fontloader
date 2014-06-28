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

    it('parses source urls', function () {
      expect(new FontFace('My Family', 'url(font.woff)', {}).src, 'to equal', 'url(font.woff)');
      expect(new FontFace('My Family', 'url("font.woff")', {}).src, 'to equal', 'url("font.woff")');
      expect(new FontFace('My Family', "url('font.woff')", {}).src, 'to equal', 'url(\'font.woff\')');
      expect(new FontFace('My Family', 'url(font.woff),url(font.otf)', {}).src, 'to equal', 'url(font.woff),url(font.otf)');
      expect(new FontFace('My Family', 'url(font.woff), url(font.otf)', {}).src, 'to equal', 'url(font.woff), url(font.otf)');
    });

    it('parses source urls with formats', function () {
      expect(new FontFace('My Family', 'url(font.woff) format(woff)', {}).src, 'to equal', 'url(font.woff) format(woff)');
      expect(new FontFace('My Family', 'url(font.woff) format(woff), url(font.otf) format(opentype)', {}).src, 'to equal', 'url(font.woff) format(woff), url(font.otf) format(opentype)');
    });

    it('throws a syntax error if source urls are invalid', function () {
      expect(function () {
        new FontFace('My Family', 'font.woff', {});
      }, 'to throw exception');
    });

    it('throws a syntax error if the source url is not a string or arraybuffer', function () {
      expect(function () {
        new FontFace('My Family', true, {});
      }, 'to throw exception');
    });

    it('parses descriptors', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { style: 'italic' }).style, 'to equal', 'italic');
      expect(new FontFace('My Family', 'url(font.woff)', { weight: 'bold' }).weight, 'to equal', '700');
      expect(new FontFace('My Family', 'url(font.woff)', { unicodeRange: 'U+FF' }).unicodeRange, 'to equal', 'U+FF');
      expect(new FontFace('My Family', 'url(font.woff)', { variant: 'small-caps' }).variant, 'to equal', 'small-caps');
    });

    // This one is currently disabled because browsers do not yet accept font-stretch as part of the font shorthand
    // syntax. Fortunately, this also means the browser does not support font-stretch, so we can just ignore it for now.
    xit('parses descriptors with stretch', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { stretch: 'condensed' }).stretch, 'to equal', 'condensed');
    });

    it('throws a syntax error if descriptors are not strings', function () {
      expect(function () {
        new FontFace('My Family', 'url(font.woff)', { style: true });
      }, 'to throw exception');
    });

    it('throws a syntax error if descriptors are invalid', function () {
      expect(function () {
        new FontFace('My Family', 'url(font.woff)', { style: 'red' });
      }, 'to throw exception');
    });

    it('defaults descriptors if not given', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.style, 'to equal', 'normal');
      expect(font.weight, 'to equal', '400');
      expect(font.unicodeRange, 'to equal', 'U+0-10FFFF');
      expect(font.variant, 'to equal', 'normal');
      expect(font.featureSettings, 'to equal', 'normal');
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
});
